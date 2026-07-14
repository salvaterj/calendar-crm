export const USER_MAP: Record<string, string> = {
  '1bfc7a3a-3d58-437a-b333-135e56109f8a': 'Mirian - Assistente Comercial',
  '201e935a-72b1-479e-8dcb-c9a7ef4215ea': 'Júlia - Consultora',
  '22fd4e32-c3bf-44f8-9e58-66ccce1428b6': 'Mariana - Gestora de Vendas',
  '378793db-802e-47ce-bee5-ce27c58bccd9': 'Lívia - Setor de Projetos',
  '7f587771-3763-462f-9322-945d37ca6650': 'Fernanda - Consultora',
  '9f9dc3de-5e74-4f29-bb05-881a500d4f74': 'Déborah - Setor de Projetos',
  'a5e7b284-6760-45bd-968b-44b2e3a28f2f': 'Beatriz - Consultora',
  'bfc6d9d6-4021-4eb7-94f5-48b53838e35a': 'Gabriela',
  'f09e45cb-a88a-4850-9e89-c2f96aab0333': 'Karen - Gerente Gabi Planejados'
}

export function resolveUserName(id?: string | null) {
  if (!id) return 'Não definido'
  return USER_MAP[id] || id
}

export const ALLOWED_TEAM_MEMBERS: readonly string[] = ['Julia', 'Fernanda', 'Mirian', 'Beatriz', 'Mariana']

export function normalizeName(value: string) {
  const decomposed = value.trim().toLowerCase().normalize('NFD')
  let result = ''
  for (const ch of decomposed) {
    if (ch.charCodeAt(0) < 128) result += ch
  }
  return result
}

export function buildIdByFirstNameMap() {
  const idByFirstName = new Map<string, string>()
  for (const [id, name] of Object.entries(USER_MAP)) {
    const first = name.split(' -')[0].trim()
    if (first) idByFirstName.set(normalizeName(first), id)
  }
  return idByFirstName
}

export function getTeamMemberOptions(names: readonly string[] = ALLOWED_TEAM_MEMBERS) {
  const idByFirstName = buildIdByFirstNameMap()
  const options: Array<{ id: string; label: string }> = []
  for (const name of names) {
    const id = idByFirstName.get(normalizeName(name))
    if (id) options.push({ id, label: name })
  }
  return options
}
