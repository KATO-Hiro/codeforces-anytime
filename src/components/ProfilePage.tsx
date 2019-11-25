import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';
import { fetchProfile, updateContestRecords } from '../actions';
import history from '../history';
import { useAccountInfo, useProfile } from '../hooks';
import { dateStringFromSeconds } from '../utils/dateString';
import { monthStringFromTime } from '../utils/dateString';
import getRatingColorStyle, {
  ratingColors,
} from '../utils/getRatingColorStyle';
import { calculateTimeTick } from '../utils/graphUtilities';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const account = useAccountInfo();
  const profile = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!account.id) {
      return;
    }
    dispatch(
      fetchProfile(
        account.id,
        () => {
          dispatch(
            updateContestRecords(
              () => setIsUpdating(true),
              () => setIsUpdating(false),
              () => setIsUpdating(false)
            )
          );
        },
        () => {
          history.push('/profile/update');
        }
      )
    );
  }, [dispatch, account]);

  if (!account.id || !profile.handle) {
    return null;
  }

  const data = profile.records
    .map((record) => {
      return {
        name: record.contestName,
        time: record.startTime,
        rating: record.newRating,
      };
    })
    .reverse();

  const nameFromTime: { [time: number]: string } = {};
  profile.records.forEach((record) => {
    nameFromTime[record.startTime] = record.contestName;
  });

  const xTick = calculateTimeTick(
    data[0].time - 1000000,
    data[data.length - 1].time + 1000000
  );

  return (
    <div>
      <Header as="h2" style={getRatingColorStyle(profile.rating)}>
        {profile.handle}
      </Header>
      <Loader inverted={true} active={isUpdating} />
      <Link to="/profile/update">
        <Button
          basic={true}
          floated="right"
          content="User setting"
          color="green"
        />
      </Link>
      <Header as="h4">
        Last Update:{dateStringFromSeconds(profile.lastUpdateTime)}
      </Header>
      <ResponsiveContainer width="95%" height={300}>
        <ScatterChart
          margin={{
            top: 10,
            right: 20,
            bottom: 20,
            left: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontalFill={ratingColors}
            fillOpacity={0.5}
            stroke="black"
          />
          <XAxis
            type="number"
            dataKey="time"
            name="date"
            domain={['dataMin - 1000000', 'dataMax + 1000000']}
            ticks={xTick}
            tickFormatter={(time) => monthStringFromTime(time)}
          />
          <YAxis
            type="number"
            dataKey="rating"
            domain={['dataMin-200', 'dataMax + 200']}
            ticks={[1200, 1400, 1600, 1900, 2100, 2400]}
            interval={0}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={(labels: any) => {
              if (labels.payload.length === 0) {
                return null;
              }
              const time: number = labels.payload[0].value;
              const rating: number = labels.payload[1].value;
              return (
                <Segment>
                  <Header as="h4" dividing={true}>
                    {nameFromTime[time]}
                  </Header>
                  <div>{dateStringFromSeconds(time)}</div>
                  <div>
                    Rating:
                    <span style={getRatingColorStyle(rating)}>{rating}</span>
                  </div>
                </Segment>
              );
            }}
          />
          <Scatter name="A school" data={data} line={true} fill="white" />
        </ScatterChart>
      </ResponsiveContainer>
      <Table celled={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Contest</Table.HeaderCell>
            <Table.HeaderCell>Rank</Table.HeaderCell>
            <Table.HeaderCell>Rating</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {profile.records.map((record) => {
            return (
              <Table.Row key={record.startTime}>
                <Table.Cell>
                  {dateStringFromSeconds(record.startTime)}
                </Table.Cell>
                <Table.Cell>{record.contestName}</Table.Cell>
                <Table.Cell>{record.rank}</Table.Cell>
                <Table.Cell style={getRatingColorStyle(record.newRating)}>
                  {record.newRating}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ProfilePage;