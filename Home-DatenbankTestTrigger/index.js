require("dotenv").config({path:'Home-DatenbankTestTrigger/.env'});
const { MongoClient } = require("mongodb");
url = process.env.MONGO_CONNECTION_STRING
const client = new MongoClient(url)

module.exports = async function (context, req) {
    const name = (req.query.name || (req.body && req.body.name)).toLowerCase();
    const email = (req.query.email || (req.body && req.body.email)).toLowerCase();
    
    let mypeople = [
        {
            name : name,
            email : email
        }
    ]

    if(req.method == "GET"){
        try {
            await client.connect();
            const database = client.db("UserDatabaseMongoDB");
            const collection = database.collection("User");
            const cursor = collection.find({})
            const results = await cursor.toArray();
            client.close();
            context.log(" ---- // " + "UserData erfolgreich von Datenbank abgerufen");
            context.res = {
                body: results
            };
        } catch (error) {
            context.log(error);
            client.close();
            context.res = {
                status: 500,
                body: { message: "Es ist ein Fehler beim abrufen der Daten aufgetreten." }
            };
        }
    }

    if (req.method == "POST") {
        try {
          await client.connect();
          const database = client.db("UserDatabaseMongoDB");
          const collection = database.collection("User");
          const existingUser = await collection.findOne({ email: email });
      
          if (existingUser && existingUser.email == mypeople[0].email) {
            client.close();
            context.res = {
              status: 400,
              body: { message: "Diese E-Mail-Adresse ist bereits registriert." },
            };
          } else if (!existingUser) {
                await collection.insertMany(mypeople);
                client.close();
                context.log(" ---- // " + "UserData erfolgreich in Datenbank gespeichert");
                context.res = {
                    body: mypeople[0],
                };
            }
        } catch (error) {
            context.log(error);
            client.close();
            context.res = {
                status: 500,
                body: { message: "Es ist ein Fehler aufgetreten." },
            };
        }
      }
     

      if(req.method == "DELETE"){
        try {
            await client.connect();
            const database = client.db("UserDatabaseMongoDB");
            const collection = database.collection("User");
            await collection.deleteMany({})
            client.close();
            context.log(" ---- // " + "UserData erfolgreich von Datenbank gelöscht");
            context.res = {
                 body: "all Data Deleted"
            };
        } catch (error) {
            context.log(error);
            client.close();
            context.res = {
                status: 500,
                body: { message: "Es ist ein Fehler beim Löschen der Daten aufgetreten." }
            };
        }
    }
}

