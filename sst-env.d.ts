/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "AnthropicSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleCalServiceAccJson": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "MyService": {
      "service": string
      "type": "sst.aws.Service"
      "url": string
    }
    "MyVpc": {
      "bastion": string
      "type": "sst.aws.Vpc"
    }
    "OpenAISecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
