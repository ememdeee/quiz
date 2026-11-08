import {
  adminGetAction,
  adminListAction,
  adminListAllAction,
  adminOverviewAction,
  adminRemoveAction,
  adminRestoreAction,
  adminSetNotesAction,
  adminSetPlanAction,
  adminSuspendAction,
} from "@/server/actions/admin";
import {
  cancelEmailChangeAction,
  connectGoogleAction,
  disconnectGoogleAction,
  getAccountAction,
  requestEmailChangeAction,
  resendEmailChangeAction,
  setPasswordAction,
  updateNameAction,
} from "@/server/actions/account";
import { addMediaAction, listMediaAction } from "@/server/actions/media";
import { loadPreviewAction } from "@/server/actions/preview";
import {
  createQuizAction,
  duplicateQuizAction,
  getProfileAction,
  getQuizAction,
  listQuizzesAction,
  publishQuizAction,
  removeQuizAction,
  renameQuizAction,
  saveDraftAction,
  setAcceptingResponsesAction,
  setSlugAction,
  slugAvailableAction,
} from "@/server/actions/quizzes";
import { listResponsesAction, removeAllResponsesAction, removeResponseAction } from "@/server/actions/responses";
import type { Repos } from "../ports";
import { remoteRunner } from "./runner";

/**
 * The real data layer: the same calls the screens already make, answered by the server actions (which talk to Supabase with the
 * logged-in person's own rights). The screens cannot tell the difference from the mock (handover 4.3).
 */
export const remoteRepos: Repos = {
  quizzes: {
    list: () => listQuizzesAction(),
    get: (id) => getQuizAction(id),
    saveDraft: (id, draft, options) => saveDraftAction(id, draft, options),
    create: (input) => createQuizAction(input),
    rename: (id, name) => renameQuizAction(id, name),
    duplicate: (id) => duplicateQuizAction(id),
    setAcceptingResponses: (id, accepting) => setAcceptingResponsesAction(id, accepting),
    publish: (id, draft) => publishQuizAction(id, draft),
    setSlug: (id, slug) => setSlugAction(id, slug),
    slugAvailable: (id, slug) => slugAvailableAction(id, slug),
    remove: (id) => removeQuizAction(id),
  },
  profiles: { getCurrent: () => getProfileAction() },
  media: { list: () => listMediaAction(), add: (input) => addMediaAction(input) },
  responses: {
    list: (quizId) => listResponsesAction(quizId),
    remove: (quizId, responseId) => removeResponseAction(quizId, responseId),
    removeAll: (quizId) => removeAllResponsesAction(quizId),
  },
  account: {
    get: () => getAccountAction(),
    updateName: (name) => updateNameAction(name),
    requestEmailChange: (email) => requestEmailChangeAction(email),
    resendEmailChange: () => resendEmailChangeAction(),
    cancelEmailChange: () => cancelEmailChangeAction(),
    setPassword: (input) => setPasswordAction(input),
    connectGoogle: () => connectGoogleAction(),
    disconnectGoogle: () => disconnectGoogleAction(),
  },
  runner: { ...remoteRunner, loadPreview: (quizId) => loadPreviewAction(quizId) },
  admin: {
    overview: () => adminOverviewAction(),
    list: (query) => adminListAction(query),
    listAll: (query) => adminListAllAction(query),
    get: (id) => adminGetAction(id),
    setPlan: (id, patch) => adminSetPlanAction(id, patch),
    setNotes: (id, notes) => adminSetNotesAction(id, notes),
    suspend: (id) => adminSuspendAction(id),
    restore: (id) => adminRestoreAction(id),
    remove: (id, typedEmail) => adminRemoveAction(id, typedEmail),
  },
};
