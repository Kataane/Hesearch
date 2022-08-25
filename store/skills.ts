import { IndexableType } from "dexie";
import { defineStore, storeToRefs } from "pinia";
import { Skill, db } from "~~/db";
import { useVacanciesStore } from "./vacancies";

const PER_PAGE = 10;
const { vacancies, skills } = db;

const { lastPrimaryKey, requestIsExpiry, params } = storeToRefs(
  useRequestStore()
);
const { status } = storeToRefs(useVacanciesStore());
const pendingStore = usePendingStore();

export const useSkillsStore = defineStore("skillsStore", () => {
  watch([params, status], async () => {
    if (status.value === "End") await fill();
  });

  const state = reactive({
    skills: [] as Skill[],
    count: 0,
  });

  const readonlyState = readonly({ PER_PAGE });

  async function fill() {
    pendingStore.addPending("skills");

    const skillsId = await skillId(lastPrimaryKey.value);
    const index = await _put(skillsId);

    // TODO: Not load all pages. Load only optimal N pages. If needed more, load other N pages.
    try {
      if (index) await _fill(lastPrimaryKey.value, index);
      await paginate(0);
      state.count = await _count(lastPrimaryKey.value);
    } catch (error) {
      console.log(error);
    } finally {
      pendingStore.deletePending("skills");
    }
  }

  async function paginate(page: number) {
    const { skills: _skills } = await skills
      .where({
        requestId: lastPrimaryKey.value,
      })
      .first();

    state.skills =
      _skills.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE) ?? [];
  }

  async function _put(skillsId: IndexableType) {
    if (skillsId === undefined || requestIsExpiry.value)
      return put(lastPrimaryKey.value, skillsId);
    return undefined;
  }

  return { fill, paginate, ...toRefs(readonlyState), ...toRefs(state) };
});

async function skillId(requestId: IndexableType) {
  const keys = await skills
    .where({
      requestId: requestId,
    })
    .primaryKeys();

  return keys.length > 0 ? keys[0] : undefined;
}

async function _count(requestId: IndexableType) {
  const _skillId = await skillId(requestId);

  const { skills: _skills } = await skills
    .where({
      id: _skillId,
    })
    .first();

  return _skills.length;
}

async function put(requestId: IndexableType, skillsId?: IndexableType) {
  return skills.put({
    id: skillsId,
    requestId: requestId,
    skills: [],
  });
}

async function _fill(requestId: IndexableType, index: IndexableType) {
  const names = await getSkills(requestId);

  const _skills = names
    .reduce(reduceByCount, [])
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count);

  return skills.update(index, {
    skills: _skills,
  });
}

function reduceByCount(acc: { count: number; name: string }[], { name }) {
  const index = acc.findIndex(
    ({ name: _name }) => _name.toLowerCase() == name.toLowerCase()
  );
  const found = index != -1;
  const item = found ? acc[index] : { count: 1, name: name };
  found ? (acc[index].count += 1) : acc.push(item);
  return acc;
}

async function getSkills(requestId: IndexableType) {
  const { vacancies: _vacancies } = await vacancies
    .where({
      requestId: requestId,
    })
    .first();
  return _vacancies
    .flatMap(({ key_skills }) => key_skills)
    .map(({ name }) => ({ name, count: 0 }));
}
