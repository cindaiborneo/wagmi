import { ethers, getMockConnector, setupWagmiClient } from '../../../test'
import { connect } from './connect'
import { getNetwork } from './getNetwork'
import { switchNetwork } from './switchNetwork'

describe('switchNetwork', () => {
  it('switches network', async () => {
    const client = await setupWagmiClient()
    const connectResult = await connect(client.connectors[0])
    const switchNetworkResult = await switchNetwork({ chainId: 69 })
    expect(
      connectResult.data?.chain?.id !== switchNetworkResult.id,
    ).toBeTruthy()
    expect(switchNetworkResult).toMatchInlineSnapshot(`
      {
        "blockExplorers": [
          {
            "name": "Etherscan",
            "url": "https://kovan-optimistic.etherscan.io",
          },
        ],
        "id": 69,
        "name": "Optimism Kovan",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Kovan Ether",
          "symbol": "KOR",
        },
        "rpcUrls": [
          "https://kovan.optimism.io",
        ],
        "testnet": true,
      }
    `)
  })

  it('switches network to same network', async () => {
    const client = await setupWagmiClient()
    await connect(client.connectors[0])
    const network1 = getNetwork()
    await switchNetwork({ chainId: 1 })
    const network2 = getNetwork()
    expect(network1.chain?.id === network2.chain?.id).toBeTruthy()
  })

  it('fails', async () => {
    const signers = await ethers.getSigners()
    const client = await setupWagmiClient({
      connectors: [
        getMockConnector({
          signer: signers[0],
          flags: {
            failSwitchChain: true,
          },
        }),
      ],
    })
    try {
      await connect(client.connectors[0])
      await switchNetwork({ chainId: 69 })
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[SwitchChainNotSupportedError: Switch chain not supported by connector]`,
      )
    }
  })
})
