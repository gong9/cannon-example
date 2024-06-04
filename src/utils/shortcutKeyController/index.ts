import hotkeys from 'hotkeys-js'
import type { ShortcutKey } from './shortcutKeyManage'
import { editorShortcuts } from './shortcutKeyManage'

type HandleFunctionType = (args: any,) => void

function factoryFunction(ShortcutKeyData: ShortcutKey) {
  return (handleFunction: HandleFunctionType) => {
    hotkeys(ShortcutKeyData.key, {
      keydown: true,
      keyup: true,
    }, (event) => {
      event.preventDefault()
      handleFunction(event)
    })
  }
}

type FactoryFunctionType = typeof factoryFunction

function shortcutKeyRegister() {
  const shortcutKeyControllerMap = new Map<string, ReturnType<FactoryFunctionType>>()

  editorShortcuts.forEach((shortcutKey) => {
    shortcutKeyControllerMap.set(shortcutKey.name, factoryFunction(shortcutKey))
  })

  return shortcutKeyControllerMap
}

export type ShortcutKeyControllerMapType = ReturnType<typeof shortcutKeyRegister>

export default shortcutKeyRegister
