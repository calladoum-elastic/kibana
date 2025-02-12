/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { BaseRetriever, type BaseRetrieverInput } from '@langchain/core/retrievers';
import { Document } from '@langchain/core/documents';
import { Client } from '@elastic/elasticsearch';
import { SearchHit } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';

export interface ElasticsearchRetrieverInput extends BaseRetrieverInput {
  /**
   * The body of the query to send to Elasticsearch
   */
  retriever: (query: string) => object;
  /**
   * The name of the field the content resides in
   */
  content_field: string | Record<string, string>;

  index: string;

  client: Client;

  k: number;

  hit_doc_mapper?: HitDocMapper;
}

type HitDocMapper = (hit: SearchHit) => Document;

export class ElasticsearchRetriever extends BaseRetriever {
  static lc_name() {
    return 'ElasticsearchRetriever';
  }

  lc_namespace = ['langchain', 'retrievers', 'elasticsearch'];

  query_body_fn: (query: string) => object;

  index: string;

  content_field: Record<string, string> | string;

  hit_doc_mapper?: HitDocMapper;

  k: number;

  client: Client;

  constructor(params: ElasticsearchRetrieverInput) {
    super(params);
    this.content_field = params.content_field;
    this.query_body_fn = params.retriever;
    this.content_field = params.content_field;

    this.index = params.index;
    this.k = params.k;
    this.client = params.client;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    try {
      const queryBody = this.query_body_fn(query);
      const results = await this.client.search({
        ...queryBody,
        index: this.index,
        size: this.k,
      });

      const hits = results.hits.hits;

      // default elasticsearch doc to LangChain doc
      let mapper: HitDocMapper = (hit: SearchHit<any>) => {
        const pageContentFieldKey =
          typeof this.content_field === 'string'
            ? this.content_field
            : this.content_field[hit._index as string];

        return new Document({
          pageContent: hit._source[pageContentFieldKey],
          metadata: {
            _score: hit._score,
            _id: hit._id,
            _index: hit._index,
          },
        });
      };

      if (this.hit_doc_mapper) {
        mapper = this.hit_doc_mapper;
      }

      const documents = hits.map(mapper);

      return documents;
    } catch (error) {
      throw error;
    }
  }
}
