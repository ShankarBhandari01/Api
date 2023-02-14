const mongoose = require('mongoose')

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('database connected!');
}).catch((e) => {
    console.log(e)
});