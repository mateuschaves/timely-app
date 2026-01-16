import {
  defineActivityAttributes,
  defineActivityAttributesModule,
} from 'expo-live-activity';

export interface WorkSessionActivityAttributes {
  appName: string;
}

export interface WorkSessionActivityContentState {
  entryTime: string;
  elapsedTime: string;
}

const WorkSessionActivityAttributes = defineActivityAttributes(
  'TimelyWorkSession',
  {
    appName: 'string',
  },
  {
    entryTime: 'string',
    elapsedTime: 'string',
  }
);

export default defineActivityAttributesModule([WorkSessionActivityAttributes]);
