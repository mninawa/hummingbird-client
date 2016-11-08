import Component from 'ember-component';
import computed from 'ember-computed';
import get from 'ember-metal/get';

export default Component.extend({
  shouldGroup: computed('feedId', {
    get() {
      const [feed] = get(this, 'feedId').split(':');
      return feed !== 'user_aggr';
    }
  }).readOnly(),

  groupedActivities: computed('activities', {
    get() {
      if (get(this, 'shouldGroup') === false) {
        return get(this, 'activities');
      }
      const groups = {};
      const activities = get(this, 'activities');
      activities.forEach((activity) => {
        const key = this._getGroupingKey(activity);
        groups[key] = groups[key] || [];
        groups[key].addObject(activity);
      });

      const result = [];
      Object.keys(groups).forEach((key) => {
        const group = groups[key];
        result.addObject({
          activity: get(group, 'firstObject'),
          others: get(group, 'length') - 1
        });
      });
      return result;
    }
  }).readOnly(),

  _getGroupingKey(activity) {
    const verb = get(activity, 'verb');
    switch (verb) {
      case 'updated':
        return `${verb}_${get(activity, 'status')}`;
      case 'progressed':
        return `${verb}_${get(activity, 'progress')}`;
      case 'rated':
        return `${verb}_${get(activity, 'rating')}`;
      case 'reviewed':
        return verb;
      default:
        throw new Error('Unsupported activity.');
    }
  }
});
