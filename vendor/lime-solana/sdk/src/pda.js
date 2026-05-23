import { PublicKey } from "@solana/web3.js";
function marketIdBuffer(marketId) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(marketId);
    return buffer;
}
export function marketPda(programId, marketId) {
    return PublicKey.findProgramAddressSync([Buffer.from("market"), marketIdBuffer(marketId)], programId);
}
export function protocolPda(programId) {
    return PublicKey.findProgramAddressSync([Buffer.from("protocol")], programId);
}
export function vaultPda(programId, marketId) {
    return PublicKey.findProgramAddressSync([Buffer.from("vault"), marketIdBuffer(marketId)], programId);
}
export function vaultTokenAuthorityPda(programId, marketId) {
    return PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), marketIdBuffer(marketId)], programId);
}
function positionSideSeed(side) {
    return Buffer.from(side === "short" ? "short" : "long");
}
export function collateralPda(programId, marketId, owner) {
    return PublicKey.findProgramAddressSync([Buffer.from("collateral"), marketIdBuffer(marketId), owner.toBuffer()], programId);
}
export function positionPda(programId, marketId, owner, side) {
    return PublicKey.findProgramAddressSync([Buffer.from("position"), marketIdBuffer(marketId), owner.toBuffer(), positionSideSeed(side)], programId);
}
export function resolutionPda(programId, marketId) {
    return PublicKey.findProgramAddressSync([Buffer.from("resolution"), marketIdBuffer(marketId)], programId);
}
export function claimPda(programId, marketId, owner, side) {
    return PublicKey.findProgramAddressSync([Buffer.from("claim"), marketIdBuffer(marketId), owner.toBuffer(), positionSideSeed(side)], programId);
}
export function refundPda(programId, marketId, owner, side) {
    return PublicKey.findProgramAddressSync([Buffer.from("refund"), marketIdBuffer(marketId), owner.toBuffer(), positionSideSeed(side)], programId);
}
export function vaultAuthorityPda(programId, marketId) {
    return PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), marketIdBuffer(marketId)], programId);
}
