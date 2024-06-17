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


Route.group(() => {
  Route.get('symbols', 'TradeController.getListSymbols')

  Route.post('recharge/create', 'RechargeController.create')
  Route.get('recharge/histories', 'RechargeController.getHistories')

  Route.get('withdraw/create', 'WithdrawController.create')
  Route.get('withdraw/histories', 'WithdrawController.getHistories')

  Route.get('level', 'LevelController/level')

// }).prefix('api').middleware('auth')
}).prefix('api')
