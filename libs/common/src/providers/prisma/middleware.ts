import { DefaultService } from '@matching/common/modules/default/default.service';
import { PrismaClient } from '@prisma/client';
import * as Constant from './prisma.constant';
// import { DefaultService } from 'src/modules/default/default.service';
export const applyMiddleware = (
  prisma: PrismaClient,
  defaultService: DefaultService,
) => {
  /*

  NOTE: this middleware requires that all tables, including join tables, have both updatedAt and deletedAt columns.
  We enforce this using a DangerJS rule.

  The following three $use() blocks correspond to three events in the query lifecycle that we are intercepting:
  1) updates
  2) deletions
  3) lookups

  Whenever we update a record, we intercept that and set an updatedAt value on the row.
  Whenever we delete a record, we have to change the action to an update, and set a deletedAt. This is our soft-delete.
  Then, when we retrieve a record, we have to always add a filter to make sure that deletedAt is null.

  The third of those complicates things for any records that have a composite key. For any other kind of lookup,
  the shape of a findUnique argument is the same as the shape of a findFirst. E.g.
    { id: "uuid" }
  
  But if you are dealing with a composite key, the argument is shaped as follows:
  { 
    key1_key2: {
      key1: "uuid",
      key2: "uuid"
    }
  }

  So because we are coercing a findUnique to a findFirst, we have to flatten that object into the following shape:
  { 
    key1: "uuid",
    key2: "uuid"
  }

  */
  // 1--------------------------------------------------------
  prisma.$use(async (params, next) => {
    const actions = ['update', 'create', 'upsert', 'updateMany'];
    const result = await next(params);
    try {
      if (actions.includes(params.action)) {
        if (
          [
            Constant.APPROVAL_MANAGEMENT,
            Constant.IMAGE_APPROVAL,
            Constant.USER_PROFILE_APPROVAL,
            Constant.VIOLATION_REPORT,
            Constant.CONTACT_WITH_ADMIN,
            Constant.MATCH_MESSAGE_APPROVAL,
          ].includes(params.model)
        ) {
          await defaultService.notifyAdmin({
            action: params.action,
            model: params.model,
          });
        }
      }
      // --change
      if (params.action == 'create' && params.model == Constant.USER_PROFILE)
        await defaultService.notifyAdmin({
          action: params.action,
          model: Constant.IMAGE_APPROVAL,
        });
      // ---
    } catch (ex) {
      console.log(ex);
    }
    return result;
  });
  // 1--------------------------------------------------------
  //2-------------------
  prisma.$use(async (params, next) => {
    // console.log('prisma hook ======>', params);
    const tableArray = [
      Constant.APPROVAL_MANAGEMENT,
      Constant.USER_PROFILE,
      Constant.MATCHING,
    ];
    const updateElastic = ['update', 'create', 'upsert'];
    if (
      params.model === Constant.USER &&
      updateElastic.includes(params.action)
    ) {
      const { args } = params;
      if (args.data && args.data.id) {
        defaultService.updateUser(args.data.id, params.action);
      } else if (args.where && args.where.id) {
        defaultService.updateUser(args.where.id, params.action);
      }
      // defaultService.updateUser();
    } else if (
      tableArray.includes(params.model) &&
      updateElastic.includes(params.action)
    ) {
      const { args } = params;
      if (args.data && args.data.userId) {
        defaultService.updateUser(args.data.userId, params.action);
      } else if (args.where && args.where.userId) {
        defaultService.updateUser(args.where.userId, params.action);
      }
    } else if (
      [Constant.MatchMessages, Constant.SEARCH_HISTORY].includes(
        params.model,
      ) &&
      // --change
      params.action === 'create'
      //--
    ) {
      const { args } = params;
      if (args.data && args.data.userId) {
        defaultService.updateUser(args.data.userId, params.action);
      } else if (args.where && args.where.userId) {
        defaultService.updateUser(args.where.userId, params.action);
      }
    } else if (Constant.USER_PROFILE && params.action === 'updateMany') {
      const { args } = params;
      // console.log(args);
      if (args.where && args.where.OR) {
        args.where.OR.forEach((e) => {
          // console.log(e.userId);
          defaultService.updateUser(e.userId, params.action);
        });
      }
      // defaultService.updateAllUser();
    }
    return next(params);
  });
  //2-------------------

  // prisma.$use(async (params, next) => {
  //   if (params.model === 'ApprovalManagement' && params.action === 'update') {
  //     console.log('appppp', params);
  //     defaultService.checkApprovalManagement(params.args.data.id);
  //   }
  //   return next(params);
  // });
  //------------------approvalManagement-approved--------------
  prisma.$use(async (params, next) => {
    const actions = ['update', 'create'];

    if (
      params.model === 'ApprovalManagement' &&
      actions.includes(params.action)
    ) {
      const before = await prisma.approvalManagement.findFirst({
        where: {
          id: params.args.where.id,
        },
      });
      console.log('prisma middle', params);
      console.log('before', before);

      const result = await next(params);
      const { args } = params;
      // if (
      //   result.approvalStatus === 'APPROVED' &&
      //   before.approvalStatus !== 'APPROVED'
      // )
      //   defaultService.pushNotificationApproval(result.userId);
      return result;
    }
    return next(params);
  });
  //------------------

  //   prisma.$use(async (params, next) => {
  //     if (params.action == 'updateMany' || params.action == 'update') {
  //       if (!params.args) {
  //         params.args = {};
  //       }
  //       if (!params.args.data) {
  //         params.args.data = {};
  //       }
  //       params.args.data['updatedAt'] = new Date();
  //     }
  //     return next(params);
  //   });
  //   prisma.$use(async (params, next) => {
  //     if (params.action == 'delete') {
  //       params.action = 'update';
  //       params.args['data'] = { deletedAt: new Date() };
  //     }
  //     if (params.action == 'deleteMany') {
  //       if (!params.args) {
  //         params.args = {};
  //       }
  //       params.action = 'updateMany';
  //       if (params.args?.data != undefined) {
  //         params.args.data['deletedAt'] = new Date();
  //       } else {
  //         params.args['data'] = { deletedAt: new Date() };
  //       }
  //     }
  //     return next(params);
  //   });
  // ---------------------------------------------------------------------------------------
  // push notification and add 100 like to user
  prisma.$use(async (params, next) => {
    if (params.model === Constant.USER_PROFILE && params.action === 'create') {
      const result = await next(params);
      // console.log('logggggg addLikeWhenUserProfileCreate', result);
      // defaultService.createLikeScheduler(result.userId);
      return result;
      // defaultService.addLikeWhenUserProfileCreate(params.args.data.userId);
    }
    return next(params);
  });
  // ---------------------------------------------------------------------------------------

  prisma.$use(async (params, next) => {
    // console.log('log from user', params);

    // const actions = ['update', 'create'];
    // if (params.model === 'UserSubscriber' && actions.includes(params.action)) {
    //   const { args } = params;
    //   if (args.data.userId)
    //     defaultService.pushNotification(
    //       args.data.userId,
    //       args.data.id,
    //       params.action,
    //     );
    // }
    try {
      if (
        params.model === 'UserSubscriber' &&
        ['upsert', 'create', 'update'].includes(params.action)
      ) {
        console.log(
          'checking params when user subs membership >>',
          JSON.stringify(params),
        );
        // return next(params);
        //when created create like scheduler
        const before = await prisma.userSubscriber.findFirst({
          where: {
            originalTransactionId: params.args.where.originalTransactionId,
          },
        });

        console.log('subscriberChange', params.model, params.action, params);
        const result = await next(params);
        const { args } = params;
        console.log('subscriberChange', result);

        if (result && result['userId']) {
          console.log("if result && result['userId']");
          if (before) {
            console.log('before =>>>>>', before);
            if (before.status !== result.status || result.status === 'RENEW') {
              console.log(
                'before.status !== result.status || result.status === RENEW',
              );
              defaultService.subscriberChange(result.id);
            } else if (
              params.action === 'update' &&
              params?.args?.data?.provider === 'GOOGLE'
            ) {
              defaultService.subscriberChange(result.id);
            }
          } else {
            console.log('not before');
            defaultService.subscriberChange(result.id);
          }
        }
        // defaultService.createLikeSchedulerIfNotExists(
        //   args.where.original_transaction_id,
        // );
        console.log('if not result');
        return result;
        //
      }
      return next(params);
    } catch (e) {
      console.log('eee', e);
    }
  });
};
