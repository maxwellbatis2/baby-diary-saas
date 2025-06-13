import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      console.log(`useLocalStorage ${key}: carregando do localStorage`)
      // Verificar se estamos no browser
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        console.log(`useLocalStorage ${key}: item encontrado:`, item)
        
        if (item && item !== 'undefined' && item !== 'null') {
          try {
            // Tentar fazer parse JSON primeiro
            let parsed
            try {
              parsed = JSON.parse(item)
            } catch {
              // Se não for JSON válido, usar como string
              parsed = item
            }
            console.log(`useLocalStorage ${key}: item parseado:`, parsed)
            setStoredValue(parsed)
          } catch (parseError) {
            console.error(`useLocalStorage ${key}: erro ao fazer parse:`, parseError)
            // Limpar item corrompido
            window.localStorage.removeItem(key)
          }
        } else {
          console.log(`useLocalStorage ${key}: nenhum item encontrado ou item é inválido`)
        }
      } else {
        console.log(`useLocalStorage ${key}: não está no browser`)
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error)
      // Limpar dados corrompidos
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } finally {
      console.log(`useLocalStorage ${key}: definindo isLoaded como true`)
      setIsLoaded(true)
    }
  }, [key])

  // Função para atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      console.log(`useLocalStorage ${key}: definindo novo valor:`, value)
      // Permitir que value seja uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Salvar no estado
      setStoredValue(valueToStore)
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        let stringified: string
        if (typeof valueToStore === 'string') {
          // Para strings, não usar JSON.stringify para evitar aspas extras
          stringified = valueToStore
        } else {
          stringified = JSON.stringify(valueToStore)
        }
        console.log(`useLocalStorage ${key}: salvando no localStorage:`, stringified)
        window.localStorage.setItem(key, stringified)
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
    }
  }

  // Função para remover o valor
  const removeValue = () => {
    try {
      console.log(`useLocalStorage ${key}: removendo valor`)
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage:`, error)
    }
  }

  console.log(`useLocalStorage ${key}: retornando:`, { storedValue, isLoaded })

  return [storedValue, setValue, removeValue, isLoaded] as const
} 