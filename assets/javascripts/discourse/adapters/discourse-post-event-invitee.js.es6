import { Result } from "discourse/adapters/rest";
import { ajax } from "discourse/lib/ajax";
import DiscoursePostEventAdapter from "./discourse-post-event-adapter";
import { underscore } from "@ember/string";

export default DiscoursePostEventAdapter.extend({
  // TODO: destroy/update/create should be improved in core to allow for nested models
  destroyRecord(store, type, record) {
    return ajax(
      this.pathFor(store, type, {
        post_id: record.post_id,
        invitee_id: record.id
      }),
      {
        type: "DELETE"
      }
    );
  },

  update(store, type, id, attrs) {
    const data = {};
    const typeField = underscore(this.apiNameFor(type));
    data[typeField] = attrs;

    return ajax(
      this.pathFor(store, type, { invitee_id: id, post_id: attrs.post_id }),
      this.getPayload("PUT", data)
    ).then(function(json) {
      return new Result(json[typeField], json);
    });
  },

  createRecord(store, type, attrs) {
    const data = {};
    const typeField = underscore(this.apiNameFor(type));
    data[typeField] = attrs;
    return ajax(
      this.pathFor(store, type, attrs),
      this.getPayload("POST", data)
    ).then(function(json) {
      return new Result(json[typeField], json);
    });
  },

  pathFor(store, type, findArgs) {
    const post_id = findArgs["post_id"];
    delete findArgs["post_id"];

    const invitee_id = findArgs["invitee_id"];
    delete findArgs["invitee_id"];

    let path =
      this.basePath(store, type, {}) +
      "events/" +
      post_id +
      "/" +
      underscore(store.pluralize(this.apiNameFor()));

    if (invitee_id) {
      path += `/${invitee_id}`;
    }

    return this.appendQueryParams(path, findArgs);
  },

  apiNameFor() {
    return "invitee";
  }
});
