export interface ShortcutKey {
  name: string
  key: string
  label?: string
  describe?: string
}
export const editorShortcuts: ShortcutKey[] = [
  {
    name: 'advance',
    key: 'w',
    label: '前进',
    describe: '前进',
  },
]
