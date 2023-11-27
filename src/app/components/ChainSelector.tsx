import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import ChainLabel from './ChainLabel'
import chains from '@/chains/chains'
import  useAccountAbstractionStore from '@/stores/accountAbstraccionStore'
import { useEffect } from 'react'

const ChainSelector = () => {
  const { chain, chainId, setChainId } = useAccountAbstractionStore()

  const handleChainChange = (event: SelectChangeEvent) => {
    setChainId(event.target.value as string)
  }
  useEffect(() => {
    console.log("chainId",chainId)
  } ,[chainId])
  

  return (
    <div>
      <FormControl fullWidth sx={{ minWidth: '150px' }}>
        <Select
          aria-label="chain selector"
          id="switch-chain-selector"
          value={chainId}
          onChange={(event: SelectChangeEvent) => handleChainChange(event)}
        >
          {chains.map((chain) => (
            <MenuItem
            key={chain.id} 
            value={chain.id} >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ChainLabel chain={chain} />
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default ChainSelector
