const { ChannelEngine } = require('eyevinn-channel-engine');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

//setter opp express
const express = require('express');
const app = express();

//nodvendig for at ting skal funke, faar CORS error ellers
const cors = require('cors');
app.use(cors());


const RecommendationEngine = require('./recengine');
const recommendationEngine = new RecommendationEngine();


class AssetManager {
    constructor() {
      this.assetTitle = null;
    }
  
  async fetchAssetById(assetId) {
    try{
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'User-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US',
      'content-type': 'application/json',
    },
    body: JSON.stringify({device: {udid: '5C5BC88C-8B0E-533E-AC0A-A4D07987F2B1', label: 'georg_MBP'}})
  };

  const response = await fetch(`https://vimond.play.cf.eu-north-1-dev.vmnd.tv/api/v2/asset/${assetId}/play?platform=web&contentType=hls&orderVersionsByPriority=true`, options);
  const jsonResponse = await response.json();
  //console.log(jsonResponse)
  return {
    id: jsonResponse.data[0].assetId,
    title: jsonResponse.data[0].assetTitle,
    uri: jsonResponse.data[0].recommendedStream.manifest.uri,
  };
  }
  catch (error){
    console.error('Error: ', error);
  }
}


async getNextVod() {
   const recommendedAssetIds = await recommendationEngine.getRecommendations();
   const randomIndex = Math.floor(Math.random() * recommendedAssetIds.length);
   const assetId = recommendedAssetIds[randomIndex];
   const assetData = await this.fetchAssetById(assetId);
   this.assetTitle = assetData.title;

    return assetData;
  }

  getAssetTitle(){
    return this.assetTitle;
  }
}

class ChannelManager {
    getChannels() {
        return [
            { id: "channel" },
        ];
    }
    
}

const myAssetManager = new AssetManager();
const myChannelManager = new ChannelManager();
const engine = new ChannelEngine(myAssetManager, {channelManager: myChannelManager});
engine.start();
engine.listen(process.env.PORT || 8080);

//endepunkt for å hente ut tittelen til asset for å vise over videospilleren
app.get('/current-title', async (req, res) => {
    try {
      const assetTitle = myAssetManager.getAssetTitle();
      res.json({ title: assetTitle });
      console.log(assetTitle);
    } catch (error) {
      console.error('Error fetching current title:', error);
    }
  });
  
  app.listen(8081, () => {
    console.log(`Express port: ${8081}`);
  });
