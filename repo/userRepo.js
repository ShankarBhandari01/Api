class UserRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    addUser = (user) => {
        return this.userModel.create(user);
    }

    getUserByUsername =(username)=>{
        return this.userModel.findOne({ username: username})
    }
}
module.exports= {
    UserRepository,
};