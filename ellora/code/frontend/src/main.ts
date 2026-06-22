import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { configureCognito } from './app/config/cognito.config';

configureCognito();
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
