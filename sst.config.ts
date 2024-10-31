/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'gen-ui-booking-ggl-cal',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws'
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc('MyVpc', { bastion: true });
    const cluster = new sst.aws.Cluster('MyCluster', { vpc });
    const openAISecret = new sst.Secret('OpenAISecret');
    const googleCalServiceAccJson = new sst.Secret('GoogleCalServiceAccJson');
    const anthropicSecret = new sst.Secret('AnthropicSecret');

    cluster.addService('MyService', {
      link: [openAISecret, googleCalServiceAccJson, anthropicSecret],
      public: {
        ports: [{ listen: '80/http', forward: '3000/http' }]
      },
      dev: {
        command: 'npm run dev'
      }
    });
  }
});
