/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return 'ok'
})

// Route.get('create', 'TestsController.create')


Route.group(() => {
  Route.get('chat', 'ConversationsController.listChat').middleware('auth')
  Route.post('create', 'ConversationsController.createChat').middleware('auth')
  Route.get('detail/:conversation_id', 'ConversationsController.getDetail').middleware('auth')
  Route.post('send', 'ChatsController.sendMessage').middleware('auth')
  Route.delete('delete/:conversation_id', 'ConversationsController.deleteChat')
    .where('conversation_id', /[^a-z$]/)
    .middleware('auth')
  Route.put('out/:conversation_id', 'ConversationsController.outConversation')
    .where('conversation_id', /[^a-z$]/)
    .middleware('auth')
  Route.put('add/:conversation_id', 'ConversationsController.addMember')
    .where('conversation_id', /[^a-z$]/)
    .middleware('auth')
}).prefix('api')
