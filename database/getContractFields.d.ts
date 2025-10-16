import sqlite from 'better-sqlite3';
import type { ContractField } from '../types/record.types.js';
export default function getContractFields(contractId: number | string, connectedDatabase?: sqlite.Database): ContractField[];
