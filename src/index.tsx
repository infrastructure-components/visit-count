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
} from "infrastructure-components";

const startTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0);
const endTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23);

const datestring = (d) => d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getHours();
const utcstring = (d) => d.getUTCFullYear() + "-" + (d.getUTCMonth()+1) + "-" + d.getUTCDate() + "-" + d.getUTCHours();

export default (
    <IsomorphicApp
        stackName = "visit-count"
        buildPath = 'build'
        assetsPath = 'assets'
        region='eu-west-1'>

        <Environment name="dev" />

        <DataLayer id="datalayer">

            <Entry
                id="visitentry"
                primaryKey="visittimestamp"
                data={{
                    visitcount: GraphQLString,
                }}
            />

            <WebApp
                id="main"
                path="*"
                method="GET">

                <Route
                    path='/'
                    name='React-Architect'
                    render={withDataLayer((props) => {

                        const start = utcstring(startTime(new Date()));
                        const end = utcstring(endTime(new Date()));
                        console.log("utc from: ", start, " to ", end);

                        return <div>
                            <Query {...props.getEntryScanQuery("visitentry", { visittimestamp: [start, end] })} >{
                                ({loading, data, error}) => {
                                    return (
                                        loading && <div>Calculating...</div>
                                    ) || (
                                        data && <div>Total visitors today: {
                                            data["scan_visitentry_visittimestamp"].reduce((total, entry) => total + parseInt(entry.visitcount), 0)
                                        }</div>
                                    ) || (
                                        <div>Error loading data</div>
                                    )
                                }
                            }</Query>
                        </div>
                    })}>

                    <Middleware callback={serviceWithDataLayer(async function (dataLayer, request, response, next) {

                        await update(
                            dataLayer.client,
                            dataLayer.updateEntryQuery("visitentry", data => ({
                                visittimestamp: utcstring(new Date()),
                                visitcount: data.visitcount ? parseInt(data.visitcount) + 1 : 1
                            }))
                        );

                        next();
                    })}/>

                </Route>
            </WebApp>
        </DataLayer>
    </IsomorphicApp>
);