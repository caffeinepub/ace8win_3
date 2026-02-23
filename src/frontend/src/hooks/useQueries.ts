import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Match, UserProfile, Transaction, PlayerInfo, Payment, PaymentStatus } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameUid,
      gameName,
      phoneNumber,
      refundQr,
    }: {
      gameUid: string;
      gameName: string;
      phoneNumber: string;
      refundQr: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(gameUid, gameName, phoneNumber, refundQr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllMatches() {
  const { actor, isFetching } = useActor();

  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMatches();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
}

export function useCreateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      startTime,
      duration,
      paymentAmount,
    }: {
      name: string;
      startTime: bigint;
      duration: bigint;
      paymentAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMatch(name, startTime, duration, paymentAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useSubmitPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      amount,
      proofScreenshot,
    }: {
      matchId: string;
      amount: bigint;
      proofScreenshot: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPayment(matchId, amount, proofScreenshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
    },
  });
}

export function useGetTransactionHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTransactionHistory(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetMatchParticipants(matchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PlayerInfo[]>({
    queryKey: ['matchParticipants', matchId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMatchParticipants(matchId);
    },
    enabled: !!actor && !isFetching && !!matchId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useApprovePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, matchId }: { user: Principal; matchId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approvePayment(user, matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['matchParticipants'] });
    },
  });
}

export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, matchId }: { user: Principal; matchId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectPayment(user, matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      gameUid,
      gameName,
      phoneNumber,
      refundQr,
    }: {
      user: Principal;
      gameUid: string;
      gameName: string;
      phoneNumber: string;
      refundQr: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(user, gameUid, gameName, phoneNumber, refundQr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaymentStatus(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentStatus | null>({
    queryKey: ['paymentStatus', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        return await actor.getPaymentStatus(user);
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 5000,
  });
}
