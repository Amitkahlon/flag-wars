import { friendsController } from "./friendsController";
import { gameController } from "./gameControllers";


export const registerControllers = () => {
  const controllers = [
    friendsController,
    gameController
  ]
  
  controllers.forEach(registerController => registerController())
} 
