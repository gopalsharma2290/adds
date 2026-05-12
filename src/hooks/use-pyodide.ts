'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

declare global {
  interface Window {
    loadPyodide: (config?: Record<string, unknown>) => Promise<PyodideInstance>
  }
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<string>
  runPython: (code: string) => string
  loadPackage: (packages: string | string[]) => Promise<void>
  loadPackagesFromImports: (code: string) => Promise<void>
  globals: Record<string, unknown>
}

interface UsePyodideReturn {
  pyodide: PyodideInstance | null
  loading: boolean
  error: string | null
  output: string
  runCode: (code: string) => Promise<string>
  loadPackages: (packages: string[]) => Promise<void>
  isRunning: boolean
}

export function usePyodide(): UsePyodideReturn {
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initPyodide = async () => {
      try {
        setLoading(true)
        // Load Pyodide from CDN
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js'
        script.async = true
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Pyodide'))
          document.head.appendChild(script)
        })

        const pyodideInstance = await (window as unknown as { loadPyodide: (config: Record<string, unknown>) => Promise<PyodideInstance> }).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
        })

        // Load micropip for package management
        await pyodideInstance.loadPackage('micropip')
        await pyodideInstance.runPythonAsync(`
import micropip
print("Pyodide initialized successfully with micropip")
`)

        setPyodide(pyodideInstance)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Pyodide')
        setLoading(false)
      }
    }

    initPyodide()
  }, [])

  const loadPackages = useCallback(async (packages: string[]) => {
    if (!pyodide) return
    setLoading(true)
    try {
      await pyodide.loadPackage(packages)
    } finally {
      setLoading(false)
    }
  }, [pyodide])

  const runCode = useCallback(async (code: string): Promise<string> => {
    if (!pyodide) return 'Pyodide not initialized yet'
    
    setIsRunning(true)
    setOutput('')
    
    try {
      // Automatically load packages from imports
      await pyodide.loadPackagesFromImports(code)

      // Redirect stdout
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`)
      
      const result = await pyodide.runPythonAsync(code)
      
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()')
      
      const fullOutput = stdout + (stderr ? '\n' + stderr : '') + (result && result !== 'None' && !stdout ? '\n' + result : '')
      setOutput(fullOutput || 'Code executed successfully (no output)')
      setIsRunning(false)
      return fullOutput || ''
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setOutput(errorMsg)
      setIsRunning(false)
      return errorMsg
    }
  }, [pyodide])

  return { pyodide, loading, error, output, runCode, loadPackages, isRunning }
}
