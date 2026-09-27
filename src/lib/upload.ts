/**
 * uploadFile / deleteFile — Operações no bucket `portfolio-assets`.
 *
 * Princípio de ordem de efeitos:
 * - Subir antes de persistir é seguro.
 * - REMOVER antes de persistir é destrutivo: se o save falhar ou o
 *   usuário cancelar, o banco aponta para arquivo que não existe mais.
 *
 * Por isso `uploadFile` não remove nada. O caller chama `deleteFile`
 * só DEPOIS que o UPDATE no banco for confirmado — compara a URL
 * antiga com a nova e remove a antiga se diferirem.
 *
 * Arquivos órfãos (novo upload abandonado por cancelamento) ficam
 * para uma rotina de coleta futura, se necessário. Não removemos
 * nada que o banco ainda possa estar referenciando.
 *
 * Segurança de tipos MIME:
 * - O bucket valida `allowed_mime_types`. Como o Storage confere o
 *   Content-Type declarado pelo cliente, ele barra tipos obviamente
 *   errados, mas não substitui validação no servidor. Isso é defesa
 *   em profundidade, não garantia.
 */
import { supabase } from "./supabase";

const PUBLIC_URL_MARKER = "/storage/v1/object/public/portfolio-assets/";

/**
 * Validação defensiva no client. O bucket também rejeita, mas o erro
 * aqui é antes de sair do browser — economiza banda e dá mensagem
 * localizada, em pt-BR.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB — alinhado com o bucket

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

/**
 * Deriva o path interno do arquivo a partir da URL pública.
 * Retorna null se a URL não pertencer ao bucket.
 *
 * Ex: ".../storage/v1/object/public/portfolio-assets/avatars/abc.jpg"
 *     → "avatars/abc.jpg"
 */
function pathFromPublicUrl(url: string): string | null {
  const idx = url.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + PUBLIC_URL_MARKER.length);
}

/**
 * Sobe um arquivo e retorna a URL pública.
 * NÃO remove nada — a remoção é responsabilidade do caller, após
 * confirmação do save no banco. Ver `deleteFile`.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024} MiB.`,
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Tipo de arquivo não permitido. Use JPG, PNG, WebP, GIF, SVG ou PDF.",
    );
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${path}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio-assets")
    .upload(fileName, file, {
      cacheControl: "31536000", // 1 ano — nomes são únicos e imutáveis
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Erro no upload do arquivo: " + uploadError.message);
  }

  const { data } = supabase.storage
    .from("portfolio-assets")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Remove um arquivo do bucket a partir da URL pública.
 * Best-effort: falhas são logadas mas não propagam — a operação
 * principal (salvar no banco) já foi concluída com sucesso.
 *
 * Silenciosamente ignora URLs que não pertencem ao bucket.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  const path = pathFromPublicUrl(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage
    .from("portfolio-assets")
    .remove([path]);

  if (error) {
    console.warn("[upload] falha ao remover arquivo antigo:", error.message);
  }
}
