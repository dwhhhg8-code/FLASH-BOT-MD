const handler = async (m, { conn }) => {

 await conn.relayMessage( m.chat,
    {
      interactiveMessage: {
        header: {
          title: "إعلان الفيسبوك"
        },
        body: {
          text: "مرحبًا, ! كيف يمكننا مساعدتك؟"
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "inapp_signup",
              buttonParamsJson: "{}"
            }
          ],
          messageParamsJson: ""
        },
      contextInfo: {}
      }
      },
      {
      }
      )

}

handler.command = ['prods']
export default handler