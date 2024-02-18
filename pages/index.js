import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  AppShell,
  Sidebar,
  SidebarSection,
  NavItem,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavGroup,
  SearchInput,
} from '@saas-ui/react'
import { FiHome, FiUsers, FiSettings, FiHelpCircle } from 'react-icons/fi';
import {
  Badge,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { IoMdAddCircleOutline } from "react-icons/io";
import DappLogo from '../public/images/logo.png';
import Image from "next/image";

export default function Page() {
    const router = useRouter();
    const isNavItemActive = (href) => router.pathname === href;
 
    const [tezos, setTezos] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [contractCode, setContractCode] = useState('');
  const [deployedContractAddress, setDeployedContractAddress] = useState(null);

  useEffect(() => {
    const initializeTezos = () => {
      const tezosInstance = new TezosToolkit('https://ghostnet.ecadinfra.com');
      setTezos(tezosInstance);
    };

    initializeTezos();
  }, []);

  const handleConnectWallet = async () => {
    const options = {
      name: 'MyAwesomeDapp',
      iconUrl: 'https://tezostaquito.io/img/favicon.svg',
      network: { type: 'ghostnet' },
      eventHandlers: {
        PERMISSION_REQUEST_SUCCESS: {
          handler: async (data) => {
            console.log('permission data:', data);
          },
        },
      },
    };
    const wallet = new BeaconWallet(options);

    try {
      
      await wallet.requestPermissions();

      tezos.setWalletProvider(wallet);

      // Retrieve the public key hash (PKH) using the tezos instance
      const pkh = await tezos.wallet.pkh();
      setConnectedWallet(pkh);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDeployContract = async () => {
    try {
      const result = await tezos.wallet.originate({
        code: [
          { prim: 'parameter', args: [{ prim: 'unit' }] },
          { prim: 'storage', args: [{ prim: 'int' }] },
          {
            prim: 'code',
            args: [
              [
                { prim: 'DROP' },
                { prim: 'PUSH', args: [{ prim: 'int' }, { int: '42' }] },
                { prim: 'NIL', args: [{ prim: 'operation' }] },
                { prim: 'PAIR' },
              ],
            ],
          },
        ],
        storage: '0', // Initial storage value (an integer)
      }).send();

       // Wait for the operation to be confirmed
    const contract = await result.contract();

    // Get the contract address
    const contractAddress = contract.address;

      setDeployedContractAddress(contractAddress);
    } catch (error) {
      console.error('Error deploying the contract:', error);
    }
  };

  return (
    <AppShell
      variant="static"
      height="100vh"
      navbar={
        <Navbar borderBottomWidth="1px" position="sticky" top="0">
          <NavbarBrand>
           <Image src={DappLogo} width={80} height={80}  ></Image>
          </NavbarBrand>
          <NavbarContent justifyContent="flex-end">
            <NavbarItem>
              <SearchInput size="sm" />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      }
      sidebar={
        <Sidebar position="sticky" top="56px" toggleBreakpoint="sm">
          <SidebarSection>
         
          <NavGroup>
              <NavItem href='/' icon={<FiHome />} 
              isActive={isNavItemActive('/')}
              >
                Home
              </NavItem>
              
              <NavItem href='/testcontract' icon={<IoMdAddCircleOutline />}
              isActive={isNavItemActive('/testcontract')}
              >Generate Mindmap</NavItem>
              
            </NavGroup>

            

           
          </SidebarSection>
          <SidebarSection flex="1" overflowY="auto"></SidebarSection>
          <SidebarSection>
            <NavItem icon={<FiHelpCircle />}>Documentation</NavItem>
         
          </SidebarSection>
        </Sidebar>
      }
    >
      <Box as="main" flex="1" py="2" px="4" overflowY="scroll">
      
      <VStack spacing={8} align="center" p={8} boxShadow="lg" borderWidth="1px" borderRadius="md">
      <Heading size="lg">Deploy your Tezos Smart Contract in 2 Clicks</Heading>

      {tezos && !connectedWallet && (
        <Button colorScheme="teal" size="md" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      )}

      {connectedWallet && (
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Wallet Address: {connectedWallet}
          </Text>
          <br></br>

          <VStack spacing={4} align="start">
            <FormControl>
              <FormLabel htmlFor="contractCode">Paste Your Smart Contract Code:</FormLabel>
              <Textarea
              height="45vh"
                id="contractCode"
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
              />
            </FormControl>

            <Button
            margin="auto"
              colorScheme="blue"
              size="md"
              onClick={handleDeployContract}
             
            >
              Deploy Contract
            </Button>

            {deployedContractAddress && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  Contract deployed successfully!
                </Text>
                <Text fontSize="md">Contract Address: {deployedContractAddress}</Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </VStack>


      </Box>
    </AppShell>
  )
}