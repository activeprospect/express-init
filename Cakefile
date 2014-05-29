{spawn, exec} = require 'child_process'
fs = require 'fs'
log = console.log

task 'build', ->
  coffeePath = './node_modules/coffee-script/bin/coffee'
  if fs.existsSync(coffeePath)
    run "#{coffeePath} -o lib -c src"
  else
    console.log('> skipping build because coffee-script is not installed')

task 'test', ->
  path = 'spec/*-spec.coffee'
  run "NODE_ENV=test ./node_modules/.bin/mocha #{path} --recursive --compilers coffee:coffee-script/register --reporter spec --colors"

task 'clean', ->
  run 'rm -fr ./lib'

run = (command) ->
  cmd = spawn '/bin/sh', ['-c', command]
  cmd.stdout.on 'data', (data) ->
    process.stdout.write data
  cmd.stderr.on 'data', (data) ->
    process.stderr.write data
  process.on 'SIGHUP', ->
    cmd.kill()
  cmd.on 'exit', (code) ->
    process.exit(code)