import React, { useEffect, useState } from 'react';
import { GraphQLString } from 'graphql';
import { Query } from 'react-apollo';
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

const setDate = (d, hours) => (
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours)
);
const pad = (n) => n<10 ? '0'+n : n;
const utcstring = (d) => (
    d.getUTCFullYear()
    + "-" + pad(d.getUTCMonth()+1)
    + "-" + pad(d.getUTCDate())
    + "-" + pad(d.getUTCHours())
);

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
                    render={withDataLayer((props) => (
                        /*const today = new Date();
                        console.log("today is from "
                            + today.getUTCFullYear()
                            + "-" + today.getUTCMonth()
                            + "-" + today.getUTCDate()
                            + "-" + 5
                            + " to "
                            + today.getUTCFullYear()
                            + "-" + parseInt(today.getUTCMonth()+1)
                            + "-" + parseInt(today.getUTCDate()+(today.getHours()+5 > 23 ? 1 : 0))
                            + "-" + 4
                        );

                        const dateToString = (d) => (
                            d.getUTCFullYear()
                            + "-" + parseInt(d.getUTCMonth()+1)
                            + "-" + d.getUTCDate()
                            + "-" + d.getUTCHours()
                        );

                        const setDate = (d, hours) => (
                            new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours)
                        );

                        console.log("today is from "
                            + dateToString(setDate(new Date(), 0))
                            + " to "
                            + dateToString(setDate(new Date(), 23))
                        );*/

                        <div>
                            <Query {...props.getEntryScanQuery('visitentry', {
                                visittimestamp: [
                                    utcstring(setDate(new Date(), 0)),
                                    utcstring(setDate(new Date(), 23))
                                ]
                            })} >{
                                ({loading, data, error}) => (
                                    loading && <div>Calculating...</div>
                                ) || (
                                    data && <div>Total visitors today: {
                                        data['scan_visitentry_visittimestamp'].reduce(
                                            (total, entry) => total + parseInt(entry.visitcount), 0
                                        )
                                    }</div>
                                ) || (
                                    <div>Error loading data</div>
                                )
                            }</Query>
                        </div>
                    ))}>

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

                            next();
                        }
                    )}/>

                </Route>
            </WebApp>
        </DataLayer>
    </IsomorphicApp>
);