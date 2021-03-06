import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Header, Loader, Table } from 'semantic-ui-react';
import {
  fetchAvailableContestInfo,
  fetchOfficialRatingRecords,
  fetchProfile,
} from '../actions';
import {
  useAccountInfo,
  useAvailableContests,
  useOfficialRatingRecords,
  useProfile,
} from '../hooks';

const ContestsPage: React.FC = () => {
  const dispatch = useDispatch();
  const account = useAccountInfo();
  const profile = useProfile();
  const availableContests = useAvailableContests();
  const virtualRanks: { [id: number]: number } = {};
  for (const record of profile.records) {
    virtualRanks[record.contestID] = record.rank;
  }
  const officialRatingRecords = useOfficialRatingRecords();
  const officialRanks: { [id: number]: number } = {};
  for (const record of officialRatingRecords) {
    officialRanks[record.contestID] = record.rank;
  }

  useEffect(() => {
    if (availableContests.length === 0) {
      dispatch(fetchAvailableContestInfo());
    }
  }, [dispatch, availableContests]);

  useEffect(() => {
    if (!account.id) {
      return;
    }
    dispatch(fetchProfile(account.id));
  }, [dispatch, account]);

  useEffect(() => {
    if (!profile.handle) {
      return;
    }
    dispatch(fetchOfficialRatingRecords(profile.handle));
  }, [dispatch, profile]);

  return (
    <>
      <Header as="h2" content="Supported contests" />
      <Table unstackable={true} celled={true}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Contest</Table.HeaderCell>
            <Table.HeaderCell>Official Rank</Table.HeaderCell>
            <Table.HeaderCell>Virtual Rank</Table.HeaderCell>
            <Table.HeaderCell>Duration</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {availableContests.map((info) => {
            return (
              <Table.Row
                key={info.name}
                warning={!!officialRanks[info.id]}
                positive={!!virtualRanks[info.id]}
              >
                <Table.Cell>
                  <a
                    href={`https://codeforces.com/contest/${info.id}`}
                    target="blank"
                  >
                    {info.name}
                  </a>
                </Table.Cell>
                <Table.Cell>{officialRanks[info.id] || '-'}</Table.Cell>
                <Table.Cell>{virtualRanks[info.id] || '-'}</Table.Cell>
                <Table.Cell>{info.durationSeconds / 60} min.</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {availableContests.length === 0 ? (
        <Loader active={true} inline="centered" />
      ) : null}
    </>
  );
};

export default ContestsPage;
