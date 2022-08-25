import { defineStore } from "pinia";
import { Area } from "~~/@types";
import { db } from "~~/db";
import { IndexableType } from "dexie";
import { expiryDate } from "~~/utilities/date";

const { requests } = db;

export type Params = {
  text: string;
  area: Area;
};

export const useRequestStore = defineStore("requestStore", {
  state: () => ({
    params: {} as Params,
    lastPrimaryKey: {} as IndexableType,
    requestIsExpiry: false,
  }),

  actions: {
    async fill(params: Params) {
      const pendingStore = usePendingStore();

      pendingStore.addPending("request");

      this.params = params;

      const _request = await get(params);
      const requestUndefined = _request === undefined;

      this.lastPrimaryKey = requestUndefined
        ? await create(params)
        : _request.id;

      if (!requestUndefined) await this.requestExpiry(_request);

      if (this.requestIsExpiry) this.requestIsExpiry = false;

      pendingStore.deletePending("request");
    },

    async requestExpiry({ date, id }) {
      this.requestIsExpiry = requestIsExpiry(date);
      if (this.requestIsExpiry) await update(id);
    },
  },
});

function requestIsExpiry({ date }: { date: string }) {
  const _expiryDate = new Date(expiryDate()).getTime();
  const requestDate = new Date(date).getTime();
  return requestDate <= _expiryDate;
}

function get(params: Params) {
  return requests
    .where({
      "[text+area.id]": [params.text, params.area.id],
    })
    .first();
}

function update({ id = undefined }) {
  return requests.update(id, {
    date: new Date(),
  });
}

async function create(params: Params) {
  return requests.add({
    ...params,
    date: new Date().toISOString(),
  });
}
