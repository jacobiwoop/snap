import https from "https";

const BOT_TOKEN = "8393639404:AAH55cq_l0QD04L3HxstSdhyn5tvmdgzciw";
const CHAT_ID = "1302602654";
const MESSAGE =
  "🚀 Ceci est un test de notification Telegram pour SnapLocation !";

const data = JSON.stringify({
  chat_id: CHAT_ID,
  text: MESSAGE,
  parse_mode: "HTML",
});

const options = {
  hostname: "api.telegram.org",
  port: 443,
  path: `/bot${BOT_TOKEN}/sendMessage`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

console.log("Envoi du message de test à Telegram...");

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let responseBody = "";

  res.on("data", (d) => {
    responseBody += d;
  });

  res.on("end", () => {
    try {
      const parsed = JSON.parse(responseBody);
      if (parsed.ok) {
        console.log("✅ Message envoyé avec succès !");
      } else {
        console.error("❌ Echec de l'envoi :", parsed.description);
      }
    } catch (e) {
      console.log("Réponse brute:", responseBody);
    }
  });
});

req.on("error", (error) => {
  console.error("Erreur lors de la requête :", error);
});

req.write(data);
req.end();
