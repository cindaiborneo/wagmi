import { useQueryClient } from '@tanstack/react-query'
import type {
  Config,
  GetConnectorClientError,
  ResolvedRegister,
} from '@wagmi/core'
import { type Evaluate } from '@wagmi/core/internal'
import {
  type GetConnectorClientData,
  type GetConnectorClientOptions,
  type GetConnectorClientQueryFnData,
  type GetConnectorClientQueryKey,
  getConnectorClientQueryOptions,
} from '@wagmi/core/query'
import { useEffect } from 'react'

import type { ConfigParameter } from '../types/properties.js'
import {
  type UseQueryParameters,
  type UseQueryResult,
  useQuery,
} from '../utils/query.js'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useConfig } from './useConfig.js'

export type UseConnectorClientParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetConnectorClientData<config, chainId>,
> = Evaluate<
  GetConnectorClientOptions<config, chainId> &
    UseQueryParameters<
      GetConnectorClientQueryFnData<config, chainId>,
      GetConnectorClientError,
      selectData,
      GetConnectorClientQueryKey<config, chainId>
    > &
    ConfigParameter<config>
>

export type UseConnectorClientReturnType<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetConnectorClientData<config, chainId>,
> = UseQueryResult<selectData, GetConnectorClientError>

/** https://wagmi.sh/react/hooks/useConnectorClient */
export function useConnectorClient<
  config extends Config = ResolvedRegister['config'],
  chainId extends config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetConnectorClientData<config, chainId>,
>(
  parameters: UseConnectorClientParameters<config, chainId, selectData> = {},
): UseConnectorClientReturnType<config, chainId, selectData> {
  const { gcTime = 0, staleTime = Infinity, ...query } = parameters
  const config = parameters.config ?? useConfig()
  const queryClient = useQueryClient()
  const { address, connector, status } = useAccount()

  const chainId = parameters.chainId ?? useChainId()
  const { queryKey, ...options } = getConnectorClientQueryOptions(config, {
    ...parameters,
    chainId,
    connector: parameters.connector ?? connector,
  })
  const enabled = Boolean(
    status !== 'disconnected' && (parameters.enabled ?? true),
  )

  // rome-ignore lint/nursery/useExhaustiveDependencies: `queryKey` not required
  useEffect(() => {
    // invalidate when address changes
    if (address) queryClient.invalidateQueries({ queryKey })
    else queryClient.removeQueries({ queryKey }) // remove when account is disconnected
  }, [address, queryClient])

  return useQuery({
    ...options,
    ...query,
    queryKey,
    enabled,
    gcTime,
    staleTime,
  })
}