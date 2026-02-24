import { cookies } from 'next/headers'

export const ACTIVE_FAMILY_COOKIE_NAME = 'rootline_active_family_id'

export async function getActiveFamilyId(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(ACTIVE_FAMILY_COOKIE_NAME)?.value || null
}

export async function setActiveFamilyId(familyId: string) {
  // TEMPORÁRIO: Next.js NÃO permite gravar cookies em páginas normais (SSR).
  // Só pode em Server Action ou Route Handler.
  // Isso evita quebrar o app e os testes.
  return;
}
