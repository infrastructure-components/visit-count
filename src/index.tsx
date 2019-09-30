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

const toDateHours = (d, hours) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours);
const pad = (n) => n<10 ? '0'+n : n;
const utcstring = (d) => d.getUTCFullYear() + "-" + pad(d.getUTCMonth()+1) + "-" + pad(d.getUTCDate()) + "-" + pad(d.getUTCHours());

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

                        return <div>
                            <Query {...props.getEntryScanQuery("visitentry", {
                                    visittimestamp: [toDateHours(new Date(), 0), toDateHours(new Date(), 23)]
                            })} >{
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