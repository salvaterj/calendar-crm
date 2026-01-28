export const USER_MAP: Record<string, string> = {
  '1bfc7a3a-3d58-437a-b333-135e56109f8a': 'Mirian - Assistente Comercial',
  '201e935a-72b1-479e-8dcb-c9a7ef4215ea': 'Júlia - Consultora',
  '378793db-802e-47ce-bee5-ce27c58bccd9': 'Lívia - Setor de Projetos',
  '7f587771-3763-462f-9322-945d37ca6650': 'Fernanda - Consultora',
  '9f9dc3de-5e74-4f29-bb05-881a500d4f74': 'Déborah - Setor de Projetos',
  'bfc6d9d6-4021-4eb7-94f5-48b53838e35a': 'Gabriela',
  'f09e45cb-a88a-4850-9e89-c2f96aab0333': 'Karen - Gerente Gabi Planejados'
}

export function resolveUserName(id?: string | null) {
  if (!id) return 'Não definido'
  return USER_MAP[id] || id
}
