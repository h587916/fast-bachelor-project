
const { GetRecommendationsCommand, PersonalizeRuntimeClient } = require("@aws-sdk/client-personalize-runtime");

class RecommendationEngine{

constructor(){
    
    this.personalizeRuntimeClient = new PersonalizeRuntimeClient({ region: 'eu-west-1' });
    
    this.getRecommendationsParam = {
        recommenderArn: "arn:aws:personalize:eu-west-1:267355461125:recommender/fast-bachelor-project-recommender",
        userId: "20", // forelopig bare en bruker
        numResults: 10
    };
}

async getRecommendations() {
    try {
      const command = new GetRecommendationsCommand(this.getRecommendationsParam);
      const response = await this.personalizeRuntimeClient.send(command);
      const itemList = response.itemList;
      const itemIds = itemList.map((item) => item.itemId);
      console.log(itemIds)
      return itemIds;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = RecommendationEngine;