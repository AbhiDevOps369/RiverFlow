const sdk = require('node-appwrite');

const client = new sdk.Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69de67a5002874a98cfd')
    .setKey('standard_587dae4f9269567e1d4fc6a263182ceff8aa4cf2274fc28f1cbacf6c89b6c9f95ed3cb9eca9bb44975d7801f26f4de45dd4ff232759dd16667846afc2ca5beab6e5db6f8a94ef48fa7dd8c6e504450b931f17419ecdb5659ff4d1a39bbef1277ba36b13dea75767d282483b04a6e290a7b7dea0dc365d35c704114616b41200f');

const databases = new sdk.Databases(client);

databases.list().then(response => {
    console.log("Found databases:");
    response.databases.forEach(db => {
        console.log(`- Name: ${db.name}, ID: ${db.$id}`);
    });
}).catch(err => {
    console.error("Error listing databases:", err);
});
