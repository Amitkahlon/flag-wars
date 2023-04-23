import { friendsController } from "./friendsController";


export const registerControllers = () => {
  const controllers = [
    friendsController
  ]
  
  controllers.forEach(registerController => registerController())
} 
