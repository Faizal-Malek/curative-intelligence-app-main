#!/usr/bin/env node
// Orchestrator: spawn the worker, run the enqueue helper, capture stdout/stderr, then exit.
const { spawn } = require('child_process')
const path = require('path')

function run() {
  return new Promise((resolve, reject) => {
    const worker = spawn('node', [path.resolve(__dirname, '../src/workers/generation-worker.js')], { env: process.env })

    worker.stdout.on('data', (d) => process.stdout.write(`[worker stdout] ${d}`))
    worker.stderr.on('data', (d) => process.stderr.write(`[worker stderr] ${d}`))

    worker.on('error', (err) => {
      console.error('Worker failed to start', err)
      reject(err)
    })

    // Give the worker a couple seconds to start listening
    setTimeout(() => {
      const enqueue = spawn('node', [path.resolve(__dirname, './test-enqueue.js')], { env: process.env })
      enqueue.stdout.on('data', (d) => process.stdout.write(`[enqueue stdout] ${d}`))
      enqueue.stderr.on('data', (d) => process.stderr.write(`[enqueue stderr] ${d}`))
      enqueue.on('exit', (code) => {
        console.log('Enqueue script exited', code)
        // Wait a few seconds for worker to process
        setTimeout(() => {
          worker.kill('SIGTERM')
          resolve()
        }, 3000)
      })
    }, 2000)
  })
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
