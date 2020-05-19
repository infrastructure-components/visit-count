import React, { useEffect, useState } from 'react';
import { Query } from 'react-apollo';


import {
    withDataLayer,
} from 'infrastructure-components';

const pad = (n) => n<10 ? '0'+n : n;

export const utcstring = (d) => (
    d.getUTCFullYear()
    + "-" + pad(d.getUTCMonth()+1)
    + "-" + pad(d.getUTCDate())
    + "-" + pad(d.getUTCHours())
);


export const setDate = (d, hours) => (
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours)
);




function VisitsPage (props) {

    console.log("render")
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

    return <div>
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
};

export default withDataLayer(VisitsPage);