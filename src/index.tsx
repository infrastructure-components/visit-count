import React, { useEffect, useState } from 'react';
import { GraphQLString } from 'graphql';

import VisitsPage, { utcstring, setDate } from './visits';

import {
    DataLayer,
    Environment,
    Entry,
    WebApp,
    Route,
    IsomorphicApp,
    Middleware,
    serviceWithDataLayer,
    update,
    withDataLayer,
    withIsomorphicState
} from 'infrastructure-components';

export default (
    <IsomorphicApp
        stackName = 'visit-count'
        buildPath = 'build'
        assetsPath = 'assets'
        region='eu-west-1'>

        <Environment name='dev'/>

        <DataLayer id='datalayer'>
            <Entry
                id='visitentry'
                primaryKey='visittimestamp'
                data={{ visitcount: GraphQLString }}
            />

            <WebApp id="main" path="*" method="GET">

                <Route
                    path='/'
                    name='React-Architect'
                    render={props => VisitsPage(props)}>

                    <Middleware callback={serviceWithDataLayer(
                        async function (dataLayer, request, response, next) {

                            await update(
                                dataLayer.client,
                                dataLayer.updateEntryQuery('visitentry', data => ({
                                    visittimestamp: utcstring(new Date()),
                                    visitcount: data.visitcount ?
                                        parseInt(data.visitcount) + 1 : 1
                                }))
                            );
                            //console.log("done")

                            return next();
                        }
                    )}/>

                </Route>
            </WebApp>
        </DataLayer>
    </IsomorphicApp>
);