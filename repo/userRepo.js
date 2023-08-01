class UserRepository {
    
    constructor(userModel) {
        this.userModel = userModel;
    }
    addUser(user){
        return this.userModel.create(user);
    }
}
export default {
    UserRepository,
  };