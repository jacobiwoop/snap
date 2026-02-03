export const sendTelegramMessage = async (message) => {
  const BOT_TOKEN = "8393639404:AAH55cq_l0QD04L3HxstSdhyn5tvmdgzciw";
  const CHAT_ID = "1302602654";
  const URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `📍 SnapLocation Alert:\n${message}`,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Telegram Error:", error);
  }
};
