/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  fetchCapabilities,
  fetchCatalogSteps,
  fetchDeployment,
  fetchDeploymentLogs,
  fetchDeployments,
  fetchIntegrationJson,
  fetchIntegrationSourceCode,
  fetchViews,
  startDeployment,
  stopDeployment,
} from '../api';
import { IDeployment, IIntegration, IStepProps, IViewProps } from '@kaoto';

// Example demonstrating interactivity with step extension
const onKaotoButtonClicked = (view: any) => {
  console.log('Button clicked! Viewing ' + view.id + ' for the following step: ' + view.step);
};

const getKaotoCatalogSteps = (): Promise<IStepProps[]> => {
  return fetchCatalogSteps().then((steps) => {
    return steps;
  });
};

const getKaotoDeployment = (name: string, namespace?: string): Promise<string | unknown> => {
  return fetchDeployment(name, namespace).then((deployment: string | unknown) => {
    return deployment;
  });
};

const getKaotoDeploymentLogs = (name: string, namespace?: string, lines?: number) => {
  return fetchDeploymentLogs(name, namespace, lines).then((log) => {
    return log;
  });
};

const getKaotoDeployments = () => {
  return fetchDeployments().then((deployments: IDeployment[]) => {
    return deployments;
  });
};

const getKaotoDSLs = (): Promise<{ [p: string]: string }[]> => {
  return fetchCapabilities().then((dsls: { dsls: { [val: string]: string }[] }) => {
    return dsls.dsls;
  });
};

const getKaotoIntegrationSource = (integration: IIntegration) => {
  return fetchIntegrationSourceCode(integration).then((sourceCode) => {
    return sourceCode;
  });
};

const getKaotoIntegrationJson = (sourceCode: string, dsl: string, namespace?: string) => {
  return fetchIntegrationJson(sourceCode, dsl, namespace).then((integration) => {
    return integration;
  });
};

const getKaotoViews = (data: IStepProps[], namespace?: string): Promise<IViewProps[]> => {
  // send JSON integrations
  // requires you to provide the integration JSON
  return fetchViews(data, namespace).then((res: IViewProps[]) => {
    return res;
  });
};

const startKaotoDeployment = (
  integration: any,
  name: string,
  namespace?: string
): Promise<string> => {
  return startDeployment(integration, name, namespace).then((res) => {
    return res;
  });
};

const stopKaotoDeployment = (name: string) => {
  return stopDeployment(name).then((res) => {
    return res;
  });
};

export {
  getKaotoCatalogSteps,
  getKaotoDeployment,
  getKaotoDeploymentLogs,
  getKaotoDeployments,
  getKaotoDSLs,
  getKaotoIntegrationJson,
  getKaotoIntegrationSource,
  getKaotoViews,
  onKaotoButtonClicked,
  startKaotoDeployment,
  stopKaotoDeployment,
};
