
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');

async function getAccessToken(req, res, next) {
  try {
    var appID = process.env.APP_ID;
    var appCertificate = process.env.APP_CERTIFICATE;
    var expirationTimeInSeconds = 84600;
    var role = RtcRole.PUBLISHER;
    var currentTimestamp = Math.floor(Date.now() / 1000);
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    var channelName = req.query.channelName;
    // var uuId = req.query.uuId;
    // use 0 if uid is not specified
    var uid = req.query.uid || 0;
    if (!channelName) {
      return resp
        .status(400)
        .json({ error: 'channel name is required' })
        .send();
    }
    var token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    let liveGig;
    if (token) {
      let data = new LiveGig({
        userId: req.user._id,
        gigId: req.query.gigId,
        channelName: channelName,
        token: token,
      });
      liveGig = await data.save();
    }
    console.log('liveGig :  ', liveGig);
    res.header('Access-Control-Allow-Origin', '*');
    if (token) {
      return res.status(httpStatus.OK).send(
        new APIResponse(
          {
            token: token,
            channelName: channelName,
            uid: uid,
            id: liveGig._id,
          },
          'Live token generated Successfully'
        )
      );
    }
    return res
      .status(httpStatus.BAD_REQUEST)
      .send(new APIResponse({}, 'Live token generated Failed'));
  } catch (error) {
    next(error);
  }
}