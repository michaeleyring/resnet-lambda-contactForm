var AWS = require('aws-sdk');
var ses = new AWS.SES();
var doc = require('dynamodb-doc');
var db = new doc.DynamoDB();

var RECEIVER = ['michael.eyring@gmail.com', 'resnet76@gmail.com'];
var SENDER = 'hello@resnethvac.com';

var response = {
 "isBase64Encoded": false,
 "headers": { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
 "statusCode": 200,
 "body": "{\"result\": \"Success.\"}"
 };

exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
    // Store the details
    var tableName = "contactForm";
    var dateTime = new Date().getTime().toString();

    var item = {
        "submitDate":dateTime,
        "emailAddress":event.email,
        "firstName":event.firstname,
        "lastName":event.lastname,
        "phoneNumber":event.phone
    };
    var params = {
      TableName:tableName,
      Item: item
    }
    console.log('Email: ', item);
    console.log('Parmas: ', params);
    db.putItem(params,function(err, event) {
      if (err) console.log(err);
      else console.log(event);
      });


    // send an email to RESNET notifying of the client request
    sendReferralEmail(event, function (err, data) {
        context.done(err, null);
    });

    // send an acknowledgement email to the user requesting contact
    sendAcknowledgmentEmail(event, function(err, data) {
        context.done(err, null);
    }, context);
    callback(null, response);
};

// Send email to RESNET notifying of the client request for contact
function sendReferralEmail (event, done) {
    var params = {
        Destination: {
            ToAddresses: [
                "michael.eyring@gmail.com",
                "resnet76@gmail.com"
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: 'First Name: ' + event.firstname + '\nLast Name: ' + event.lastname + '\nphone: ' + event.phone + '\nemail: ' + event.email,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Website Referral Form: ' + event.firstname + ' ' + event.lastname,
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    };
    ses.sendEmail(params, done);
}

// Send an acknowledgement to the user who filled out the contact form on the website
function sendAcknowledgmentEmail (event, done, context) {

  if (!event.email.match(/^[^@]+@[^@]+$/)) {
    console.log('Not sending: invalid email address', event);
    context.done(null, "Failed");
    return;
  }
    const htmlBody = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Thank you!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body bgcolor="#FFFFFF">
  <table cellpadding="10" cellspacing="0" style=
  "background-color: #FFFFFF" width="100%">
    <tr>
      <td>
        <table align="center" cellpadding="0" cellspacing="0" class=
        "content" style="background-color: #FFFFFF">
          <tr>
            <td valign="top">
              <p style="text-align:center;margin:0;padding:0;"><img src=
              "https://www.resnethvac.com/img/sound-308418__340.png"
              style="display:inline-block;"><br><b style="font-size: 26px">Rainbow Environmental Systems, Ltd.<b></p>
            </td>
          </tr>
          <tr>
            <td align="center" valign="top">
              <table  cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="bodyContent" valign="top" >
                    <h1><strong>Thank you! We've received your request for a consultation.</strong></h1>

                    <h3>
                      <p>We will reach out to you via the phone/email details which you provided to understand your needs and schedule a consultation.</p>
                      <p>If you need immediate attention or this is an urgent matter, please call us at 631-413-3292.</p>
                      <p>I look forward to reviewing your issue and working together on solutions.</p></h3>
                  </td>
                </tr>

                <tr align="top">
                  <td class="bodyContentImage" valign="top">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="margin:0;padding:0;" valign=
                        "top" width="50" mc:edit="welcomeEdit-03">
                          <p style="margin-bottom:10px"><img src=
                          "https://www.resnethvac.com/img/resnet.png"
                          style="display:block;"></p>
                        </td>

                        <td align="left" style="width:15px;margin:0;padding:0;"
                        valign="top" width="15">&nbsp;</td>

                        <td align="left" style=
                        "margin:0;padding-top:10px;line-height:1;" valign=
                        "top" mc:edit="welcomeEdit-04">
                          <h4><strong>John Romano</strong></h4>
                          <h5>Owner, Rainbow Environmental Systems, Ltd.</h5>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

            <tr>
            <td align="center" class="unSubContent" id="bodyCellFooter" valign=
            "top">
              <table cellpadding="0" cellspacing="0" id=
              "templateContainerFooter" width="100%">
                <tr>
                  <td valign="top" width="100%" mc:edit="welcomeEdit-11">
                    <h6 style="text-align:center;margin-top: 9px;">Rainbow Environmental Systems, Ltd.</h6>
                    <h6 style="text-align:center;">Lake&nbsp;Grove,&nbsp; NY&nbsp;11755</h6>
                    <h6 style="text-align:center;margin-top: 7px;">This email was sent based on a specific request made at https://www.resnethvac.com. If you did not make this request, please email us at resnet76@gmail.com</h6>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <style type="text/css">

    span.preheader {
    display:none!important
    }
    td ul li {
      font-size: 16px;
    }

    /* /\/\/\/\/\/\/\/\/ CLIENT-SPECIFIC STYLES /\/\/\/\/\/\/\/\/ */
    #outlook a {
    padding:0
    }

    /* Force Outlook to provide a "view in browser" message */
    .ReadMsgBody {
    width:100%
    }

    .ExternalClass {
    width:100%
    }

    /* Force Hotmail to display emails at full width */
    .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {
    line-height:100%
    }

    /* Force Hotmail to display normal line spacing */
    body,table,td,p,a,li,blockquote {
    -webkit-text-size-adjust:100%;
    -ms-text-size-adjust:100%
    }

    /* Prevent WebKit and Windows mobile changing default text sizes */
    table,td {
    mso-table-lspace:0;
    mso-table-rspace:0
    }

    /* Remove spacing between tables in Outlook 2007 and up */
    /* /\/\/\/\/\/\/\/\/ RESET STYLES /\/\/\/\/\/\/\/\/ */
    body {
    margin:0;
    padding:0
    }

    img {
    max-width:100%;
    border:0;
    line-height:100%;
    outline:none;
    text-decoration:none
    }

    table {
    border-collapse:collapse!important
    }

    .content {
    width:100%;
    max-width:600px
    }

    .content img {
    height:auto;
    min-height:1px
    }

    #bodyTable {
    margin:0;
    padding:0;
    width:100%!important
    }

    #bodyCell {
    margin:0;
    padding:0
    }

    #bodyCellFooter {
    margin:0;
    padding:0;
    width:100%!important;
    padding-top:39px;
    padding-bottom:15px
    }

    body {
    margin:0;
    padding:0;
    min-width:100%!important
    }

    #templateContainerHeader {
    font-size:14px;
    padding-top:2.429em;
    padding-bottom:.929em
    }

    #templateContainerFootBrd {
    background-clip:padding-box;
    border-spacing:0;
    height:10px;
    width:100%!important
    }


    #templateContainerMiddleBtm .bodyContent {
    padding-bottom:2em
    }

    h1 {
    color:#2e2e2e;
    display:block;
    font-family:Helvetica;
    font-size:26px;
    line-height:1.385em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    h2 {
    color:#2e2e2e;
    display:block;
    font-family:Helvetica;
    font-size:22px;
    line-height:1.455em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    h3 {
    color:#545454;
    display:block;
    font-family:Helvetica;
    font-size:18px;
    line-height:1.444em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }


    h4 {
    color:#545454;
    display:block;
    font-family:Helvetica;
    font-size:14px;
    line-height:1.571em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    h5 {
    color:#545454;
    display:block;
    font-family:Helvetica;
    font-size:13px;
    line-height:1.538em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    h6 {
    color:#545454;
    display:block;
    font-family:Helvetica;
    font-size:12px;
    line-height:2em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    p {
    color:#545454;
    display:block;
    font-family:Helvetica;
    font-size:16px;
    line-height:1.5em;
    font-style:normal;
    font-weight:400;
    letter-spacing:normal;
    margin-top:0;
    margin-right:0;
    margin-bottom:15px;
    margin-left:0;
    text-align:left
    }

    .unSubContent a:visited {
    color:#a1a1a1;
    text-decoration:underline;
    font-weight:400
    }

    .unSubContent a:focus {
    color:#a1a1a1;
    text-decoration:underline;
    font-weight:400
    }

    .unSubContent a:hover {
    color:#a1a1a1;
    text-decoration:underline;
    font-weight:400
    }

    .unSubContent a:link {
    color:#a1a1a1;
    text-decoration:underline;
    font-weight:400
    }

    .unSubContent a .yshortcuts {
    color:#a1a1a1;
    text-decoration:underline;
    font-weight:400
    }

    .unSubContent h6 {
    color:#a1a1a1;
    font-size:12px;
    line-height:1.5em;
    margin-bottom:0
    }

    .bodyContent {
    color:#505050;
    font-family:Helvetica;
    font-size:14px;
    line-height:150%;
    padding-top:3.143em;
    padding-right:3.5em;
    padding-left:3.5em;
    padding-bottom:.714em;
    text-align:left
    }

    .bodyContentImage {
    color:#505050;
    font-family:Helvetica;
    font-size:14px;
    line-height:150%;
    padding-top:0;
    padding-right:3.571em;
    padding-left:3.571em;
    padding-bottom:1.357em;
    text-align:left
    }

    .bodyContentImage h4 {
    color:#4E4E4E;
    font-size:13px;
    line-height:1.154em;
    font-weight:400;
    margin-bottom:0
    }

    .bodyContentImage h5 {
    color:#828282;
    font-size:12px;
    line-height:1.667em;
    margin-bottom:0
    }

    a:visited {
    color:#3386e4;
    text-decoration:none;
    }

    a:focus {
    color:#3386e4;
    text-decoration:none;
    }

    a:hover {
    color:#3386e4;
    text-decoration:none;
    }

    a:link {
    color:#3386e4;
    text-decoration:none;
    }

    a .yshortcuts {
    color:#3386e4;
    text-decoration:none;
    }

    .bodyContent img {
    height:auto;
    max-width:498px
    }

    .footerContent {
    color:gray;
    font-family:Helvetica;
    font-size:10px;
    line-height:150%;
    padding-top:2em;
    padding-right:2em;
    padding-bottom:2em;
    padding-left:2em;
    text-align:left
    }

    .footerContent a:link,.footerContent a:visited,/* Yahoo! Mail Override */ .footerContent a .yshortcuts,.footerContent a span /* Yahoo! Mail Override */ {
    color:#606060;
    font-weight:400;
    text-decoration:underline
    }

    .bodyContentImageFull p {
    font-size:0!important;
    margin-bottom:0!important
    }

    .brdBottomPadd .bodyContent {
    padding-bottom:2.286em
    }

    .brdBottomPadd-two .bodyContent {
    padding-bottom:.857em
    }



    .bodyContentTicks {
    color:#505050;
    font-family:Helvetica;
    font-size:14px;
    line-height:150%;
    padding-top:2.857em;
    padding-right:3.5em;
    padding-left:3.5em;
    padding-bottom:1.786em;
    text-align:left
    }

    .splitTicks {
    width:100%
    }

    .splitTicks--one {
    width:19%;
    color:#505050;
    font-family:Helvetica;
    font-size:14px;
    padding-bottom:1.143em
    }

    .splitTicks--two {
    width:5%
    }

    .splitTicks--three {
    width:71%;
    color:#505050;
    font-family:Helvetica;
    font-size:14px;
    padding-top:.714em
    }

    .splitTicks--three h3 {
    margin-bottom:.278em
    }

    .splitTicks--four {
    width:5%
    }

    @media only screen and (max-width: 550px),screen and (max-device-width: 550px) {
    body[yahoo] .hide {
    display:none!important
    }

    body[yahoo] .buttonwrapper {
    background-color:transparent!important
    }

    body[yahoo] .button {
    padding:0!important
    }

    body[yahoo] .button a {
    background-color:#e05443;
    padding:15px 15px 13px!important
    }

    body[yahoo] .unsubscribe {
    font-size:14px;
    display:block;
    margin-top:.714em;
    padding:10px 50px;
    background:#2f3942;
    border-radius:5px;
    text-decoration:none!important
    }
    }

    @media only screen and (max-width: 480px),screen and (max-device-width: 480px) {
      .bodyContentTicks {
        padding:6% 5% 5% 6%!important
      }

      .bodyContentTicks td {
        padding-top:0!important
      }

      h1 {
        font-size:34px!important
      }

      h2 {
        font-size:30px!important
      }

      h3 {
        font-size:24px!important
      }

      h4 {
        font-size:18px!important
      }

      h5 {
        font-size:16px!important
      }

      h6 {
        font-size:14px!important
      }

      p {
        font-size:18px!important
      }

      .brdBottomPadd .bodyContent {
        padding-bottom:2.286em!important
      }

      .brdBottomPadd-two .bodyContent {
        padding-bottom:.857em!important
      }

      #templateContainerMiddleBtm .bodyContent {
        padding:6% 5% 5% 6%!important
      }

      .bodyContent {
        padding:6% 5% 1% 6%!important
      }

      .bodyContent img {
        max-width:100%!important
      }

      .bodyContentImage {
        padding:3% 6% 6%!important
      }

      .bodyContentImage img {
        max-width:100%!important
      }

      .bodyContentImage h4 {
        font-size:16px!important
      }

      .bodyContentImage h5 {
        font-size:15px!important;
        margin-top:0
      }
    }
    .ii a[href] {color: inherit !important;}
    span > a, span > a[href] {color: inherit !important;}
    a > span, .ii a[href] > span {text-decoration: inherit !important;}
  </style>

</body>
</html>
`;

const textBody = ``;

  // Create sendEmail params
  const params = {
    Destination: {
      ToAddresses: [event.email]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Thanks for requesting a consultation with Rainbow Environmental Systems!"
      }
    },
    Source: "John from Rainbow Environmental Systems <hello@resnethvac.com>"
  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(data => {
      console.log(data.MessageId);
      context.done(null, "Success");
    })
    .catch(err => {
      console.error(err, err.stack);
      context.done(null, "Failed");
    });
}
