import { css } from '@emotion/css';
import React, { useCallback, useMemo } from 'react';

import {
  DataSourceJsonData,
  DataSourceInstanceSettings,
  DataSourcePluginOptionsEditorProps,
  GrafanaTheme2,
  KeyValue,
} from '@grafana/data';
import { DataSourcePicker } from '@grafana/runtime';
import { InlineField, InlineFieldRow, Input, useStyles2, InlineSwitch } from '@grafana/ui';

import { TagMappingInput } from './TagMappingInput';

// @deprecated use getTraceToLogsOptions to get the v2 version of this config from jsonData
export interface TraceToLogsOptions {
  datasourceUid?: string;
  tags?: string[];
  mappedTags?: Array<KeyValue<string>>;
  mapTagNamesEnabled?: boolean;
  spanStartTimeShift?: string;
  spanEndTimeShift?: string;
  filterByTraceID?: boolean;
  filterBySpanID?: boolean;
  lokiSearch?: boolean; // legacy
}

export interface TraceToLogsOptionsV2 {
  datasourceUid?: string;
  tags?: Array<KeyValue<string>>;
  spanStartTimeShift?: string;
  spanEndTimeShift?: string;
  filterByTraceID?: boolean;
  filterBySpanID?: boolean;
  query?: string;
  customQuery: boolean;
}

export interface TraceToLogsData extends DataSourceJsonData {
  tracesToLogs?: TraceToLogsOptions;
  tracesToLogsV2?: TraceToLogsOptionsV2;
}

export function getTraceToLogsOptions(data: TraceToLogsData): TraceToLogsOptionsV2 | undefined {
  if (data.tracesToLogsV2) {
    return data.tracesToLogsV2;
  }
  if (!data.tracesToLogs) {
    return undefined;
  }

  const traceToLogs: TraceToLogsOptionsV2 = {
    customQuery: false,
  };
  traceToLogs.datasourceUid = data.tracesToLogs.datasourceUid;
  traceToLogs.tags = data.tracesToLogs.mapTagNamesEnabled
    ? data.tracesToLogs.mappedTags
    : data.tracesToLogs.tags?.map((tag) => ({ key: tag }));
  traceToLogs.filterByTraceID = data.tracesToLogs.filterByTraceID;
  traceToLogs.filterBySpanID = data.tracesToLogs.filterBySpanID;
  traceToLogs.spanStartTimeShift = data.tracesToLogs.spanStartTimeShift;
  traceToLogs.spanEndTimeShift = data.tracesToLogs.spanEndTimeShift;
  return traceToLogs;
}

interface Props extends DataSourcePluginOptionsEditorProps<TraceToLogsData> {}

export function TraceToLogsSettings({ options, onOptionsChange }: Props) {
  const styles = useStyles2(getStyles);
  const supportedDataSourceTypes = [
    'loki',
    'elasticsearch',
    'grafana-splunk-datasource', // external
    'grafana-opensearch-datasource', // external
  ];

  const traceToLogs = useMemo(
    (): TraceToLogsOptionsV2 => getTraceToLogsOptions(options.jsonData) || { customQuery: false },
    [options.jsonData]
  );
  const { query = '', tags, customQuery } = traceToLogs;

  const updateTracesToLogs = useCallback(
    (value: Partial<TraceToLogsOptionsV2>) => {
      // Cannot use updateDatasourcePluginJsonDataOption here as we need to update 2 keys, and they would overwrite each
      // other as updateDatasourcePluginJsonDataOption isn't synchronized
      onOptionsChange({
        ...options,
        jsonData: {
          ...options.jsonData,
          tracesToLogsV2: {
            ...traceToLogs,
            ...value,
          },
          tracesToLogs: undefined,
        },
      });
    },
    [onOptionsChange, options, traceToLogs]
  );

  return (
    <div className={css({ width: '100%' })}>
      <h3 className="page-heading">Trace to logs</h3>

      <div className={styles.infoText}>
        Trace to logs lets you navigate from a trace span to the selected data source&apos;s logs.
      </div>

      <InlineFieldRow>
        <InlineField tooltip="The data source the trace is going to navigate to" label="Data source" labelWidth={26}>
          <DataSourcePicker
            inputId="trace-to-logs-data-source-picker"
            filter={(ds) => supportedDataSourceTypes.includes(ds.type)}
            current={traceToLogs.datasourceUid}
            noDefault={true}
            width={40}
            onChange={(ds: DataSourceInstanceSettings) =>
              updateTracesToLogs({
                datasourceUid: ds.uid,
              })
            }
          />
        </InlineField>
      </InlineFieldRow>

      <TimeRangeShift
        type={'start'}
        value={traceToLogs.spanStartTimeShift || ''}
        onChange={(val) => updateTracesToLogs({ spanStartTimeShift: val })}
      />
      <TimeRangeShift
        type={'end'}
        value={traceToLogs.spanEndTimeShift || ''}
        onChange={(val) => updateTracesToLogs({ spanEndTimeShift: val })}
      />

      <InlineFieldRow>
        <InlineField
          tooltip="Tags that will be used in the Loki query. Default tags: 'cluster', 'hostname', 'namespace', 'pod'"
          label="Tags"
          labelWidth={26}
        >
          <TagMappingInput values={tags ?? []} onChange={(v) => updateTracesToLogs({ tags: v })} />
        </InlineField>
      </InlineFieldRow>

      <IdFilter
        type={'trace'}
        id={'filterByTraceID'}
        value={Boolean(traceToLogs.filterByTraceID)}
        onChange={(val) => updateTracesToLogs({ filterByTraceID: val })}
      />
      <IdFilter
        type={'span'}
        id={'filterBySpanID'}
        value={Boolean(traceToLogs.filterBySpanID)}
        onChange={(val) => updateTracesToLogs({ filterBySpanID: val })}
      />

      <InlineFieldRow>
        <InlineField
          tooltip="Use custom query with possibility to interpolate variables from the trace or span."
          label="Use custom query"
          labelWidth={26}
        >
          <InlineSwitch
            value={customQuery}
            onChange={(event: React.SyntheticEvent<HTMLInputElement>) =>
              updateTracesToLogs({ customQuery: event.currentTarget.checked })
            }
          />
        </InlineField>
      </InlineFieldRow>

      <InlineField
        disabled={!customQuery}
        label="Query"
        labelWidth={26}
        tooltip="The query that will run when navigating from a trace to logs data source. Interpolate tags using the `$__tags` keyword."
        grow
      >
        <Input
          label="Query"
          type="text"
          allowFullScreen
          value={customQuery ? query : '$__tags'}
          onChange={customQuery ? (e) => updateTracesToLogs({ query: e.currentTarget.value }) : () => {}}
        />
      </InlineField>
    </div>
  );
}

interface IdFilterProps {
  type: 'trace' | 'span';
  id: string;
  value: boolean;
  onChange: (val: boolean) => void;
}
function IdFilter(props: IdFilterProps) {
  return (
    <InlineFieldRow>
      <InlineField
        label={`Filter by ${props.type} ID`}
        labelWidth={26}
        grow
        tooltip={`Filters logs by Span ID. Appends '|=<${props.type} id>' to the query.`}
      >
        <InlineSwitch
          id={props.id}
          value={props.value}
          onChange={(event: React.SyntheticEvent<HTMLInputElement>) => props.onChange(event.currentTarget.checked)}
        />
      </InlineField>
    </InlineFieldRow>
  );
}

interface TimeRangeShiftProps {
  type: 'start' | 'end';
  value: string;
  onChange: (val: string) => void;
}
function TimeRangeShift(props: TimeRangeShiftProps) {
  return (
    <InlineFieldRow>
      <InlineField
        label={`Span ${props.type} time shift`}
        labelWidth={26}
        grow
        tooltip={`Shifts the ${props.type} time of the span. Default 0 Time units can be used here, for example: 5s, 1m, 3h`}
      >
        <Input
          type="text"
          placeholder="1h"
          width={40}
          onChange={(e) => props.onChange(e.currentTarget.value)}
          value={props.value}
        />
      </InlineField>
    </InlineFieldRow>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  infoText: css`
    padding-bottom: ${theme.spacing(2)};
    color: ${theme.colors.text.secondary};
  `,
});
