"use client";
import React, { SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

function ProviderSelector(): React.JSX.Element {
  const [providerSelected, setProviderSelected] = React.useState("edesur");

  const router = useRouter();

  const handleProviderRoute = () => {
    router.push(`/dashboard?provider=${providerSelected}`);
  };

  const handleProviderChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setProviderSelected(event.target.value);
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <span className="border-b-2 border-red-500 py-1">
        Select your Provider
      </span>
      <label htmlFor="selectedProviderId" className="flex flex-col gap-1">
        Provider:
        <select
          id="selectedProviderId"
          name="selectedProvider"
          className="py-2 px-2 self-center"
          onChange={(e) => handleProviderChange(e)}
        >
          <option value="edesur">Edesur</option>
          <option value="edenor">Edenor</option>
        </select>
      </label>
      <button
        onClick={handleProviderRoute}
        className="bg-white border-blue-500 border-2 px-6 py-2 rounded-lg"
      >
        <span>Get Data</span>
      </button>
    </div>
  );
}

export default ProviderSelector;
